import { createClient } from "@supabase/supabase-js";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { getWeton } from "@/utils";
import { basicReadingPrompt } from "@/utils/prompts"; // Ensure this path is correct

// Initialize Supabase (using public anon key is safe here; user auth verified via token)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase env vars missing!");
  // We might throw an error here or handle it depending on desired behavior on startup
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Google Gemini AI Client
if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL: Gemini API Key env var missing!");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const READING_LIMIT = 2; // Set your desired free reading limit
// Optional: Configure Gemini Safety Settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// ========================================
// API ROUTE HANDLER FUNCTION
// ========================================
export default async function handler(req, res) {
  // <<< Opening brace for handler function

  // 1. Check Request Method
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ error: "Method Not Allowed. Only POST requests are accepted." });
  } // <<< Closing brace for if block

  // ========================================
  // TRY BLOCK: Main logic
  // ========================================
  try {
    // <<< Opening brace for try block

    // 2. Authenticate User via Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization header is missing or invalid." });
    }
    const token = authHeader.split(" ")[1];
    // const {
    //   data: { user },
    //   error: userError,
    // } = await supabase.auth.getUser(token);

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
    // User is authenticated: user.id is available

    // 3. Fetch User Profile & Check Reading Count/Birth Date
    const { data: profile, error: profileError } = await supabaseUserClient
      .from("profiles")
      .select("birth_date")
      .eq("id", user.id)
      .single(); // Expect one row or null

    // Handle database errors during profile fetch
    if (profileError && profileError.code !== "PGRST116") {
      // Ignore "Row not found" error code
      console.error("API Profile Fetch DB Error:", profileError);
      return res
        .status(500)
        .json({ error: "Database error while fetching profile." });
    }

    // Check if profile exists and birth date is set
    if (!profile || !profile.birth_date) {
      return res.status(400).json({
        error:
          "Profile incomplete. Please ensure your birth date is set in your profile.",
      });
    }

    // // Check if user has exceeded the reading limit
    // if (profile.readings_count >= READING_LIMIT) {
    //   return res.status(429).json({
    //     error: `Free reading limit (${READING_LIMIT}) reached. Please upgrade for more readings.`,
    //   });
    // }

    // 4. Calculate Weton Details using the utility function
    const wetonDetails = getWeton(profile.birth_date);
    if (!wetonDetails) {
      console.error(
        `API Weton Calculation Error for date: ${profile.birth_date}, User ID: ${user.id}`
      );
      return res.status(500).json({
        error:
          "Failed to calculate Weton details. There might be an issue with the birth date provided.",
      });
    }

    // 5. Prepare Prompt and Call Gemini AI

    // --- Define the AI Model ---
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Or "gemini-pro" / "gemini-1.5-pro"
      safetySettings, // Apply defined safety settings
      // generationConfig: { // Optional: Further configuration
      //   temperature: 0.7,
      //   topK: 1,
      //   topP: 1,
      //   maxOutputTokens: 2048,
      // },
    });

    const prompt = basicReadingPrompt(profile, wetonDetails);

    // --- Construct the Prompt (Using template literal for multi-line string) ---
    //     const prompt = `
    // You are the Weton and Primbon Master, an expert digital assistant specializing in Javanese Weton analysis, grounded in traditional Primbon knowledge but communicating clearly. Your personality is wise, respectful, positive, and culturally sensitive.

    // **User's Weton Data:**
    // * **Gender:** ${profile.gender}
    // * **Weton:** ${wetonDetails.weton}
    // * **Day (Dina):** ${wetonDetails.dayName} (Neptu: ${wetonDetails.dayNeptu})
    // * **Market Day (Pasaran):** ${wetonDetails.pasaranName} (Neptu: ${
    //       wetonDetails.pasaranNeptu
    //     })
    // * **Total Neptu:** ${wetonDetails.totalNeptu}

    // **Your Task:**
    // Based *only* on the Weton data provided above, generate an insightful analysis and fortune readings covering these aspects
    // 1. Watak (character, personality, personal traits): Describe the general nature, core strengths, and potential challenges associated with this specific Weton combination and its total Neptu value. Keep it balanced.

    // 2. Jodoh (love, relationships, and romantic life): Discuss general romantic inclinations. Briefly mention Neptu values (e.g., "The total Neptu of X and Y") or specific Weton names considered traditionally harmonious or potentially needing more adjustment, with a brief reasoning based on compatibility concepts (like Neptu division or specific traditional pairings). Avoid absolutes.

    // 3. Rezeki (Career & Financial Fortune): outline general potential regarding finances, suitable career paths, work styles, or areas where fortune might flow more easily for this Weton. Indicate the general pattern of fortune (e.g., consistent, fluctuating) if traditionally associated with the Neptu.

    // 4. Pergaulan (Interactions): describe the possible interaction traits of this individual

    // 5. Pemikiran (Cognition): describe how the individual makes a decision, thinks, processes reality, and relates to others.

    // 6. Perjalanan Hidup (General Life Outlook): Provide a brief, encouraging perspective on the individual's life path. Highlight key themes or positive potential inherent in the Weton, possibly suggesting areas for personal growth or awareness.

    // 7. Main element

    // 8. Main lucky color

    // 9. Main lucky animal

    // 10. Return all the answers only in JSONB object literal format without any additional markdown formatting character like codeblocks and syntax highlighting. Using snake_case style for the key name.

    // 11. Don't return and exclude the ${"```json"} text on the beginning and ${"```"} text at the end from the answer.

    // **Mandatory Instructions:**
    // - Maintain a **respectful, positive, and encouraging** tone. Avoid negative fortune-telling or deterministic statements. Answering in English is fine.

    // - Base the analysis **strictly on common, traditional Javanese Primbon interpretations** associated with the given Weton/Neptu. Do not invent details.

    // **Begin the analysis**
    // `; // <<< End of the prompt template literal

    // --- Make the API Call ---
    console.log(
      `API: Calling Gemini for Weton: ${
        wetonDetails.weton
      } (User: ${user.id.substring(0, 8)}...)`
    ); // Log initiation
    const generationResult = await model.generateContent(prompt);
    const geminiResponse = await generationResult.response;

    // --- Process the Response ---
    if (!geminiResponse) {
      console.error(
        `API: Gemini response object was null or undefined for User: ${user.id}`
      );
      throw new Error("AI service returned an invalid response object.");
    }

    // Check for safety blocks or other issues before accessing text()
    if (geminiResponse.promptFeedback?.blockReason) {
      console.error(
        `API: Gemini prompt blocked for User: ${user.id}. Reason: ${geminiResponse.promptFeedback.blockReason}`
      );
      throw new Error(
        `AI could not generate a response due to safety constraints (${geminiResponse.promptFeedback.blockReason}). Please try rephrasing or contact support if this persists.`
      );
    }

    const analysisText = geminiResponse.text(); // Use .text() method

    if (!analysisText) {
      console.error(
        `API: Gemini response text was empty for User: ${user.id}. Finish Reason: ${geminiResponse.candidates?.[0]?.finishReason}`
      );
      throw new Error(
        "AI service returned an empty analysis. Please try again."
      );
    }
    console.log(
      `API: Received Gemini analysis for User: ${user.id.substring(0, 8)}...`
    ); // Log success

    // 6. Send Successful Response Back to Client
    // The client-side code is responsible for calling the RPC to increment the count.
    return res.status(200).json({
      // wetonDetails: wetonDetails, // Include the calculated Weton details
      analysis: analysisText, // Include the AI-generated analysis
      wetonAnalysis: geminiResponse,
    });

    // ========================================
    // CATCH BLOCK: Handle errors
    // ========================================
  } catch (error) {
    // <<< Opening brace for catch block
    console.error("API Route /api/getFortune encountered an error:", error); // Log the detailed error server-side

    let statusCode = 500;
    let errorMessage = "An unexpected server error occurred.";

    // Customize error messages based on caught error type/message
    if (error.status) {
      // If error object has a status property (like from fetch errors)
      statusCode = error.status;
    }
    if (error.message) {
      // Provide more specific (but safe) error messages
      if (error.message.includes("API key not valid")) {
        errorMessage = "AI service configuration error."; // Don't reveal key details
      } else if (
        error.message.includes("AI could not generate") ||
        error.message.includes("AI service returned")
      ) {
        errorMessage = error.message; // Pass back specific AI generation errors
      } else if (error.message.includes("limit")) {
        statusCode = 429; // Ensure correct status code for limits
        errorMessage = error.message;
      } else if (
        error.message.includes("Authentication failed") ||
        error.message.includes("Authorization header")
      ) {
        statusCode = 401;
        errorMessage = error.message;
      } else if (error.message.includes("Profile incomplete")) {
        statusCode = 400;
        errorMessage = error.message;
      }
      // Add more specific error checks if needed
    }

    // Send the formatted error response
    return res.status(statusCode).json({ error: errorMessage });
  } // <<< Closing brace for catch block
  // ========================================
} // <<< <<<<<<<< FINAL CLOSING BRACE for the 'handler' function >>>>>>>>>>
// ========================================
