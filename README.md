# Zaffle — starter project

Backing code for the Zaffle TRD: a PWA where a licensed nonprofit runs
home raffles, brokers submit listings, and buyers purchase numbered
tickets from a fixed pool.

## What's here

- `supabase/migrations/0001_init.sql` — full Postgres schema, RLS
  policies, and the atomic `purchase_tickets()` function that prevents
  overselling the fixed ticket pool under concurrent buyers.
- `supabase/functions/raffle-engine` — scheduled Edge Function that
  closes raffles at their deadline, checks the minimum-raise threshold,
  and runs the draw or flags the raffle for a lister/admin decision.
- `supabase/functions/stripe-webhook` — handles `payment_intent.succeeded`
  and `charge.refunded` events from Stripe Connect.
- `src/lib/supabaseClient.js` — frontend Supabase client and example
  queries.

## What you need to fill in before this is live

1. **Create a Supabase project** and run the migration:
   ```
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
2. **Enable PostGIS** — the migration does this automatically, but
   confirm it under Database > Extensions if you hit an error.
3. **Create a Stripe Connect platform account** and set the secret keys
   as Edge Function secrets:
   ```
   supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. **Schedule the raffle engine** — Supabase Edge Functions don't run on
   a timer by themselves. Use `pg_cron` (Database > Cron Jobs) to call
   the function's URL every few minutes, or an external scheduler.
5. **Finalize the draw method** (see TRD Section 11, item 2) — the
   current `drawWinner()` function in `raffle-engine/index.ts` uses
   `crypto.getRandomValues`, which is cryptographically sound but not
   yet auditable after the fact. Whoever owns compliance should sign
   off on the final provably-fair approach before this goes live with
   real raffles.
6. **Add real license/permit verification** — the schema has the
   fields (`license_verified`, `raffle_permits`), but the actual
   verification step (manual review vs. a state licensing-board API)
   still needs to be built.
7. **Legal review** — the pilot state's charitable raffle statute needs
   to be checked against `state_rulesets` before launch. This starter
   code enforces whatever values you put in that table, but doesn't
   know the rules itself.

## Run it locally right now (mock data, no Supabase needed yet)

The buyer-flow UI in `src/App.jsx` runs entirely on mock data — you can
click through it today without touching Supabase or Stripe.

```
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). This is a
real, interactive build of the prototype — browse, open a listing, buy
tickets, everything works against the mock listings in the code.

## Push it to GitHub

```
cd zaffle-starter
git init
git add .
git commit -m "Initial Zaffle prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Create the empty repo on GitHub first (github.com/new) if you haven't —
don't initialize it with a README there, since you already have one.

## Deploy to GitHub Pages

1. Open `vite.config.js` and set `base: "/<your-repo-name>/"` to match
   the exact name of the GitHub repo you just pushed to. This step trips
   people up more than anything else — if it doesn't match, the deployed
   site loads a blank page because assets 404.
2. Do the same in `public/manifest.webmanifest` (`start_url` and `scope`).
3. Install the deploy dependency and ship it:
   ```
   npm install
   npm run deploy
   ```
   This builds the site and pushes the `dist` folder to a `gh-pages`
   branch using the `gh-pages` package.
4. On GitHub: go to your repo's **Settings > Pages**, and under
   "Build and deployment," set the source branch to `gh-pages` (folder
   `/root`). Save.
5. Your site will be live at `https://<your-username>.github.io/<your-repo-name>/`
   within a minute or two. Re-run `npm run deploy` any time you want to
   push updates.

### If you'd rather skip the base-path fuss: Vercel or Netlify

Both auto-detect Vite, deploy on every push, and don't need the `base`
path trick since they serve from the domain root. If you go this route,
set `base: "/"` in `vite.config.js` instead. Connect the GitHub repo at
vercel.com/new or app.netlify.com — no config file needed for either.

## Next step: wire it to real data

Once you're happy clicking through the mock version, the path to a live
app is swapping the hardcoded `LISTINGS` array in `src/App.jsx` for the
`fetchActiveListings()` call in `src/lib/supabaseClient.js`, and running
the Supabase migration so that data actually exists. See the sections
below for the backend setup.
