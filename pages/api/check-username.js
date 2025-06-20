import { createClient } from "@supabase/supabase-js";

// Initialize Supabase (using public anon key is safe here; user auth verified via token)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase env vars missing!");
}

export default async function handler(req, res) {
  // 1. Check Request Method
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ error: "Method Not Allowed. Only POST requests are accepted." });
  }

  try {
    // 2. Authenticate User via Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization header is missing or invalid." });
    }
    const token = authHeader.split(" ")[1];

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      console.error(
        "API Auth Error:",
        userError?.message || "No user found for token"
      );
      return res
        .status(401)
        .json({ error: "Authentication failed. Invalid or expired token." });
    }

    // 3. Check username availability
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Direct database query with authenticated client
    const { data, error } = await supabaseUserClient
      .from("profiles")
      .select("id, username")
      .eq("username", username.toLowerCase());

    if (error) {
      console.error("API Username Check Error:", error);
      return res
        .status(500)
        .json({ error: "Error checking username availability" });
    }

    // Return the result
    return res.status(200).json({
      available: !data || data.length === 0,
      // If not available, only return true/false, not the user info
    });
  } catch (error) {
    console.error("API Username Check Error:", error);
    return res.status(500).json({
      error:
        "An unexpected error occurred while checking username availability",
    });
  }
}
