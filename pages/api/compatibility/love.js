import {
  generateLoveBasicReading,
  generateLoveCompatibilityReading,
} from "@/services/reading-services";
import { waitUntil } from "@vercel/functions";
import { supabase } from "@/utils/supabaseClient";
// import NextCors from "nextjs-cors";

export const config = {
  runtime: "edge",
};

export default async function handler(req, res) {
  // await NextCors(req, res, {
  //   methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  //   origin: "*",
  //   optionsSuccessStatus: 200,
  // });

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Or your specific frontend domain
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(204).end();
  }

  // Set the CORS header on the actual response.
  // This must be done for all responses you send back.
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "POST") {
    if (
      !req.body ||
      !req.body.profile1 ||
      !req.body.profile2 ||
      !req.body.wetonJodoh
    ) {
      return res.status(400).json({
        message: "Profile data (e.g., weton) is required in the request body.",
      });
    }

    const { profile1, profile2, wetonJodoh } = req.body;
    // console.log(profile1, profile2, wetonJodoh);
    try {
      waitUntil(
        generateLoveCompatibilityReading(profile1, profile2, wetonJodoh)
      );
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
