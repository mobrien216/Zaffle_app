import { createClient } from "@supabase/supabase-js";

// Populate these from your Supabase project settings and .env file.
// Never expose the service role key to the client — only the anon key
// belongs here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example: fetch active listings within a radius using the PostGIS
// ST_DWithin function via an RPC, or a plain filtered select for the
// simpler list view.
export async function fetchActiveListings() {
  const { data, error } = await supabase
    .from("listings")
    .select("*, raffles(*)")
    .eq("status", "active");

  if (error) throw error;
  return data;
}

// Example: purchase tickets via the atomic Postgres function so the
// fixed ticket pool can never be oversold under concurrent buyers.
// In production this should be called from your backend/edge function
// after Stripe confirms payment, not directly from the client.
export async function purchaseTickets({ raffleId, buyerId, quantity, pricePaid, paymentIntentId }) {
  const { data, error } = await supabase.rpc("purchase_tickets", {
    p_raffle_id: raffleId,
    p_buyer_id: buyerId,
    p_quantity: quantity,
    p_price_paid: pricePaid,
    p_stripe_payment_intent_id: paymentIntentId,
  });

  if (error) throw error;
  return data;
}
