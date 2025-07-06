import { generateLoveProReading2 } from "@/services/reading-services";
import { waitUntil } from "@vercel/functions";

export default async function handler(req, res) {
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

    try {
      const { profile } = req.body;

      if (!profile) {
        return res.status(400).json({ error: "Profile is required" });
      }

      waitUntil(generateLoveProReading2(profile));
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
