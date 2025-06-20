import { generatePrimaryTraitsReading } from "@/services/reading-services";
import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase (using public anon key is safe here; user auth verified via token)
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error("CRITICAL: Supabase env vars missing!");
// }

// export const config = {
//   runtime: "edge",
// };

export default async function handler(req, res) {
  console.log("req method", req.method);

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ error: "Method Not Allowed. Only POST requests are accepted." });
  }

  if (req.method === "POST") {
    if (!req.body || !req.body.profile) {
      return res.status(400).json({
        message: "Profile data (e.g., weton) is required in the request body.",
      });
    }

    // console.log(profile);
    try {
      // const authHeader = req.headers.authorization;
      // if (!authHeader || !authHeader.startsWith("Bearer ")) {
      //   return res
      //     .status(401)
      //     .json({ error: "Authorization header is missing or invalid." });
      // }
      // const token = authHeader.split(" ")[1];

      // const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      //   global: { headers: { Authorization: `Bearer ${token}` } },
      // });

      // const {
      //   data: { user },
      //   error: userError,
      // } = await supabaseUserClient.auth.getUser();

      // if (userError || !user) {
      //   console.error(
      //     "API Auth Error:",
      //     userError?.message || "No user found for token"
      //   );
      //   return res
      //     .status(401)
      //     .json({ error: "Authentication failed. Invalid or expired token." });
      // }

      const { profile } = req.body;

      if (!profile) {
        return res.status(400).json({ error: "Profile is required" });
      }

      waitUntil(generatePrimaryTraitsReading(profile));
      // Send a 202 Accepted response immediately as the task is offloaded
      return res
        .status(202)
        .json({ message: "Reading generation has been initiated." });
    } catch (error) {
      console.error(
        "API daily reading - Error initiating background task:",
        error
      );
      return res.status(500).json({
        message: "Error initiating daily reading generation.",
        // error: error.message, // Consider exposing error.message only in development
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
