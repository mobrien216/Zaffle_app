-- Zaffle initial schema
-- Run via: supabase db push  (or paste into the Supabase SQL editor)
-- Assumes the pilot launches in a single state; state_rulesets is still
-- modeled as a table so expansion doesn't require a schema change.

create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- ---------- Enums ----------
create type user_role as enum ('buyer', 'lister', 'nonprofit_admin', 'platform_admin');
create type listing_status as enum ('draft', 'pending_review', 'scheduled', 'active', 'pending_resolution', 'resolved', 'sold', 'cancelled');
create type raffle_status as enum ('scheduled', 'active', 'pending_resolution', 'resolved', 'cancelled');
create type resolution_action as enum ('extended', 'refunded', 'drawn');
create type permit_status as enum ('pending', 'approved', 'expired', 'revoked');
create type notification_type as enum ('new_listing_match', 'raffle_24h', 'raffle_1h', 'raffle_resolved', 'refund_issued', 'raffle_extended');
create type notification_channel as enum ('push', 'email', 'sms');

-- ---------- Core tables ----------

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'buyer',
  full_name text,
  state_of_residence text,
  birthdate date,
  phone text,
  license_number text,
  license_state text,
  license_expiration date,
  license_verified boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nonprofits (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  ein text not null,
  stripe_connect_account_id text,
  default_payout_split jsonb not null default '{"nonprofit":0.7,"broker_fee":0.1,"platform_fee":0.2}',
  created_at timestamptz not null default now()
);

create table public.raffle_permits (
  id uuid primary key default uuid_generate_v4(),
  nonprofit_id uuid not null references public.nonprofits(id),
  state text not null,
  permit_number text not null,
  issued_date date not null,
  expiration_date date not null,
  document_url text,
  status permit_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.state_rulesets (
  state text primary key,
  min_buyer_age int not null default 18,
  max_ticket_price numeric,
  max_prize_value numeric,
  residency_restricted boolean not null default true,
  requires_id_verification boolean not null default false,
  notes text
);

create table public.listings (
  id uuid primary key default uuid_generate_v4(),
  lister_id uuid not null references public.users(id),
  nonprofit_id uuid not null references public.nonprofits(id),
  permit_id uuid not null references public.raffle_permits(id),
  address_line1 text not null,
  city text not null,
  state text not null,
  zip text not null,
  geom geography(Point, 4326) not null,
  bedrooms numeric,
  bathrooms numeric,
  square_feet numeric,
  lot_size numeric,
  year_built int,
  features jsonb not null default '[]',
  description text,
  photos text[] not null default '{}',
  appraised_value numeric not null,
  minimum_raise_threshold numeric not null,
  status listing_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_geom_idx on public.listings using gist (geom);
create index listings_status_idx on public.listings (status);

create table public.raffles (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id),
  ticket_pool_size int not null,
  tickets_sold int not null default 0,
  ticket_price_tiers jsonb not null default '[{"qty":1,"price":20},{"qty":3,"price":50},{"qty":7,"price":100}]',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  total_raised numeric not null default 0,
  status raffle_status not null default 'scheduled',
  resolution_action resolution_action,
  winning_ticket_number int,
  winner_user_id uuid references public.users(id),
  draw_method text,
  draw_proof jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_sold_within_pool check (tickets_sold <= ticket_pool_size)
);

create index raffles_status_ends_idx on public.raffles (status, ends_at);

create table public.tickets (
  id uuid primary key default uuid_generate_v4(),
  raffle_id uuid not null references public.raffles(id),
  buyer_id uuid not null references public.users(id),
  ticket_numbers int[] not null,
  price_paid numeric not null,
  stripe_payment_intent_id text,
  purchased_at timestamptz not null default now(),
  refunded boolean not null default false
);

create index tickets_raffle_idx on public.tickets (raffle_id);
create index tickets_buyer_idx on public.tickets (buyer_id);

create table public.saved_searches (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.users(id),
  center_geom geography(Point, 4326) not null,
  radius_miles numeric not null default 25,
  filters jsonb not null default '{}',
  push_subscription jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id),
  type notification_type not null,
  payload jsonb not null default '{}',
  sent_at timestamptz not null default now(),
  channel notification_channel not null
);

-- ---------- Atomic ticket purchase function ----------
-- Prevents overselling the fixed pool under concurrent purchases.
create or replace function public.purchase_tickets(
  p_raffle_id uuid,
  p_buyer_id uuid,
  p_quantity int,
  p_price_paid numeric,
  p_stripe_payment_intent_id text
) returns public.tickets
language plpgsql
security definer
as $$
declare
  v_raffle public.raffles%rowtype;
  v_start int;
  v_numbers int[];
  v_ticket public.tickets%rowtype;
begin
  select * into v_raffle from public.raffles where id = p_raffle_id for update;

  if v_raffle.status <> 'active' then
    raise exception 'Raffle is not active';
  end if;

  if v_raffle.tickets_sold + p_quantity > v_raffle.ticket_pool_size then
    raise exception 'Not enough tickets remaining in the pool';
  end if;

  v_start := v_raffle.tickets_sold + 1;
  select array_agg(generate_series) into v_numbers
    from generate_series(v_start, v_start + p_quantity - 1);

  update public.raffles
    set tickets_sold = tickets_sold + p_quantity,
        total_raised = total_raised + p_price_paid,
        updated_at = now()
    where id = p_raffle_id;

  insert into public.tickets (raffle_id, buyer_id, ticket_numbers, price_paid, stripe_payment_intent_id)
  values (p_raffle_id, p_buyer_id, v_numbers, p_price_paid, p_stripe_payment_intent_id)
  returning * into v_ticket;

  return v_ticket;
end;
$$;

-- ---------- Row Level Security ----------
alter table public.users enable row level security;
alter table public.nonprofits enable row level security;
alter table public.raffle_permits enable row level security;
alter table public.state_rulesets enable row level security;
alter table public.listings enable row level security;
alter table public.raffles enable row level security;
alter table public.tickets enable row level security;
alter table public.saved_searches enable row level security;
alter table public.notifications_log enable row level security;

create or replace function public.current_user_role() returns user_role
language sql security definer stable as $$
  select role from public.users where id = auth.uid();
$$;

-- users: self read/update, admins read all
create policy "users read own" on public.users for select using (id = auth.uid());
create policy "users update own" on public.users for update using (id = auth.uid());
create policy "admins read all users" on public.users for select using (
  public.current_user_role() in ('nonprofit_admin', 'platform_admin')
);

-- listings: public read of live listings, lister CRUD on own drafts, admin full access
create policy "public reads live listings" on public.listings for select using (
  status in ('active', 'scheduled', 'pending_resolution', 'resolved', 'sold')
);
create policy "lister manages own draft listings" on public.listings for all using (
  lister_id = auth.uid() and status in ('draft', 'pending_review')
) with check (lister_id = auth.uid());
create policy "admins manage all listings" on public.listings for all using (
  public.current_user_role() in ('nonprofit_admin', 'platform_admin')
);

-- raffles: public read, admin/system write
create policy "public reads raffles" on public.raffles for select using (true);
create policy "admins manage raffles" on public.raffles for all using (
  public.current_user_role() in ('nonprofit_admin', 'platform_admin')
);

-- tickets: buyers read own, admins read all, inserts only via purchase_tickets()
create policy "buyers read own tickets" on public.tickets for select using (buyer_id = auth.uid());
create policy "admins read all tickets" on public.tickets for select using (
  public.current_user_role() in ('nonprofit_admin', 'platform_admin')
);

-- saved searches: owner only
create policy "buyers manage own saved searches" on public.saved_searches for all using (buyer_id = auth.uid());

-- notifications: owner read only
create policy "users read own notifications" on public.notifications_log for select using (user_id = auth.uid());

-- permits and rulesets: public read (transparency), admin write
create policy "public reads permits" on public.raffle_permits for select using (true);
create policy "admins manage permits" on public.raffle_permits for all using (
  public.current_user_role() in ('nonprofit_admin', 'platform_admin')
);
create policy "public reads rulesets" on public.state_rulesets for select using (true);
create policy "admins manage rulesets" on public.state_rulesets for all using (
  public.current_user_role() = 'platform_admin'
);
