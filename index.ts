// Supabase Edge Function: raffle-engine
// Deploy: supabase functions deploy raffle-engine
// Schedule: pair with pg_cron or an external scheduler to invoke this
// every few minutes via a POST request.
//
// Responsibilities:
// 1. Find raffles whose ends_at has passed and are still 'active'.
// 2. If total_raised >= the listing's minimum_raise_threshold, run the draw.
// 3. Otherwise, flip status to 'pending_resolution' and notify the lister
//    and nonprofit admin so they can choose extend vs. refund.
//
// The randomization approach below is a placeholder structure, not a
// finalized compliance decision — see TRD Section 11, item 2. Whatever
// method is chosen (drand beacon, committed-hash + public seed, etc.)
// should populate draw_method and draw_proof so the result is auditable.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  const { data: dueRaffles, error } = await supabase
    .from("raffles")
    .select("*, listings(minimum_raise_threshold, lister_id, nonprofit_id)")
    .eq("status", "active")
    .lte("ends_at", new Date().toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results = [];

  for (const raffle of dueRaffles ?? []) {
    const threshold = raffle.listings.minimum_raise_threshold;

    if (raffle.total_raised >= threshold) {
      const winningNumber = await drawWinner(raffle.id, raffle.tickets_sold);

      const { data: winningTicket } = await supabase
        .from("tickets")
        .select("buyer_id")
        .eq("raffle_id", raffle.id)
        .contains("ticket_numbers", [winningNumber])
        .maybeSingle();

      await supabase
        .from("raffles")
        .update({
          status: "resolved",
          resolution_action: "drawn",
          winning_ticket_number: winningNumber,
          winner_user_id: winningTicket?.buyer_id ?? null,
          draw_method: "TODO: finalize provably-fair method with compliance",
          draw_proof: { drawn_at: new Date().toISOString() },
        })
        .eq("id", raffle.id);

      await supabase.from("listings").update({ status: "sold" }).eq("id", raffle.listing_id);

      // TODO: trigger Stripe Connect payout transfer to the nonprofit's
      // connected account per listings.nonprofit_id -> nonprofits.default_payout_split
      // TODO: enqueue 'raffle_resolved' notifications to all ticket holders

      results.push({ raffle: raffle.id, outcome: "drawn", winningNumber });
    } else {
      await supabase.from("raffles").update({ status: "pending_resolution" }).eq("id", raffle.id);

      // TODO: enqueue an admin notification so the lister/nonprofit admin
      // can call the extend or refund action from the admin dashboard.

      results.push({ raffle: raffle.id, outcome: "pending_resolution" });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

// Placeholder RNG — replace with the finalized provably-fair method.
// A cryptographically secure draw should combine a value committed to
// before the raffle closed (so it can't be chosen after the fact) with
// a public, independently verifiable source of randomness.
async function drawWinner(raffleId: string, ticketsSold: number): Promise<number> {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % ticketsSold) + 1;
}
