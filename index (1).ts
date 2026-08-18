// Supabase Edge Function: stripe-webhook
// Deploy: supabase functions deploy stripe-webhook
// Point your Stripe webhook endpoint (Connect account, ticket purchases)
// at this function's URL. Verify the signature before trusting any event.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const { raffleId, buyerId, quantity } = intent.metadata as Record<string, string>;

      // Calls the atomic purchase_tickets() Postgres function defined in
      // 0001_init.sql — this is what actually assigns ticket numbers and
      // increments tickets_sold safely under concurrent purchases.
      const { error } = await supabase.rpc("purchase_tickets", {
        p_raffle_id: raffleId,
        p_buyer_id: buyerId,
        p_quantity: Number(quantity),
        p_price_paid: intent.amount / 100,
        p_stripe_payment_intent_id: intent.id,
      });

      if (error) {
        console.error("Ticket assignment failed after successful payment", error);
        // TODO: alert ops — money was captured but tickets weren't assigned.
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      await supabase
        .from("tickets")
        .update({ refunded: true })
        .eq("stripe_payment_intent_id", charge.payment_intent as string);
      break;
    }

    default:
      // Ignore other event types.
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
