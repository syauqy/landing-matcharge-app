// pages/api/cron.js

import { createClient } from "@supabase/supabase-js";

// This is the main function for the API route
export default async function handler(req, res) {
  // 1. Secure the endpoint
  // Check for the secret bearer token sent by the Vercel Cron Job
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send("Unauthorized");
  }

  // 2. The main logic
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const revenueCatApiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;

    // Get all users from your database who are still marked as 'pro'
    const { data: proUsers, error: dbError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("subscription_status", "pro");

    if (dbError) throw dbError;

    // Loop through each user and check their status with the RevenueCat API
    for (const user of proUsers) {
      const response = await fetch(
        `https://api.revenuecat.com/v1/subscribers/${user.id}`,
        {
          headers: { Authorization: `Bearer ${revenueCatApiKey}` },
        }
      );

      const data = await response.json();
      const proEntitlement = data.subscriber.entitlements.Pro; // Using 'Pro' with capital P

      // If the 'Pro' entitlement is missing or expired, downgrade the user
      if (
        !proEntitlement ||
        new Date(proEntitlement.expires_date) < new Date()
      ) {
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "free" })
          .eq("id", user.id);
      }
    }

    // Send a success response
    return res.status(200).json({ message: "Subscription check complete." });
  } catch (error) {
    // Send an error response
    return res.status(500).json({ error: error.message });
  }
}
