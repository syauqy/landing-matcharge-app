// pages/api/get-fortune.js
import { createClient } from "@supabase/supabase-js";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { getWeton } from "@/utils";
import { basicReadingPrompt } from "@/utils/prompts";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase env vars missing!");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Google Gemini AI Client
if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL: Gemini API Key env var missing!");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const READING_LIMIT = 2;

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ error: "Method Not Allowed. Only POST requests are accepted." });
  }

  try {
    // Authenticate User
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

    // Fetch User Profile
    const { data: profile, error: profileError } = await supabaseUserClient
      .from("profiles")
      .select("birth_date")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("API Profile Fetch DB Error:", profileError);
      return res
        .status(500)
        .json({ error: "Database error while fetching profile." });
    }

    if (!profile || !profile.birth_date) {
      return res.status(400).json({
        error:
          "Profile incomplete. Please ensure your birth date is set in your profile.",
      });
    }

    // Calculate Weton Details
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

    // Prepare Prompt and Call Gemini AI
    const modelOverride = req.headers["x-model-override"];
    const modelName = modelOverride || "gemini-1.5-flash"; // Default model

    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings,
    });

    const prompt = basicReadingPrompt(profile, wetonDetails);

    // console.log(prompt)

    console.log(
      `API: Calling Gemini (${modelName}) for Weton: ${
        wetonDetails.weton
      } (User: ${user.id.substring(0, 8)}...)`
    );
    const generationResult = await model.generateContent(prompt);
    const geminiResponse = await generationResult.response;

    if (!geminiResponse) {
      console.error(
        `API: Gemini response object was null or undefined for User: ${user.id}`
      );
      throw new Error("AI service returned an invalid response object.");
    }

    if (geminiResponse.promptFeedback?.blockReason) {
      console.error(
        `API: Gemini prompt blocked for User: ${user.id}. Reason: ${geminiResponse.promptFeedback.blockReason}`
      );
      throw new Error(
        `AI could not generate a response due to safety constraints (${geminiResponse.promptFeedback.blockReason}). Please try rephrasing or contact support if this persists.`
      );
    }

    const analysisText = geminiResponse.text();

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
    );

    return res.status(200).json({
      analysis: analysisText,
      wetonDetails: wetonDetails,
      wetonAnalysis: geminiResponse,
    });
  } catch (error) {
    console.error("API Route /api/getFortune encountered an error:", error);

    let statusCode = 500;
    let errorMessage = "An unexpected server error occurred.";

    if (error.status) {
      statusCode = error.status;
    }
    if (error.message) {
      if (error.message.includes("API key not valid")) {
        errorMessage = "AI service configuration error.";
      } else if (
        error.message.includes("AI could not generate") ||
        error.message.includes("AI service returned")
      ) {
        errorMessage = error.message;
      } else if (error.message.includes("limit")) {
        statusCode = 429;
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
    }

    return res.status(statusCode).json({ error: errorMessage });
  }
}
