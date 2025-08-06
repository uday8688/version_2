import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === "paid") {
      // Update payment record in database
      const { error } = await supabaseClient.from("payments").insert({
        amount: session.amount_total! / 100, // Convert from cents
        payment_type: session.metadata?.payment_type || "other",
        status: "completed",
        payment_date: new Date().toISOString().split('T')[0],
        stripe_payment_id: session.payment_intent as string,
        notes: `Payment via Stripe Checkout - Session: ${sessionId}`,
        due_date: new Date().toISOString().split('T')[0],
        // Note: lease_id would need to be provided based on user's active lease
      });

      if (error) {
        console.error("Database update error:", error);
      }

      // Create notification
      await supabaseClient.from("notifications").insert({
        user_id: user.id,
        title: "Payment Successful",
        message: `Your ${session.metadata?.payment_type || "payment"} of $${(session.amount_total! / 100).toFixed(2)} has been processed successfully.`,
        type: "success",
      });
    }

    return new Response(JSON.stringify({ 
      status: session.payment_status,
      amount: session.amount_total! / 100
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});