import {
  generateLoveBasicReading,
  generateLoveCompatibilityReading,
} from "@/services/reading-services";
import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabase } from "@/utils/supabaseClient";
// import NextCors from "nextjs-cors";

export const config = {
  runtime: "edge",
};

const allowedOrigin = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";

export default async function handler(req) {
  // await NextCors(req, res, {
  //   methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  //   origin: "*",
  //   optionsSuccessStatus: 200,
  // });

  if (req.method === "OPTIONS") {
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", allowedOrigin); // Or your specific frontend domain: 'http://localhost:3000'
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    // Instead of res.setHeader, we return a new Response object with headers
    return new Response(null, { status: 204, headers });
  }

  if (req.method === "POST") {
    const responseHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Credentials": "true",
    };

    if (
      !req.body ||
      !req.body.profile1 ||
      !req.body.profile2 ||
      !req.body.wetonJodoh
    ) {
      return NextResponse.json(
        { message: "Profile data is required." },
        { status: 400, headers: responseHeaders }
      );
    }

    const { profile1, profile2, wetonJodoh } = req.body;
    // console.log(profile1, profile2, wetonJodoh);
    try {
      waitUntil(
        generateLoveCompatibilityReading(profile1, profile2, wetonJodoh)
      );
      // Send a 202 Accepted response immediately as the task is offloaded
      return NextResponse.json(
        { message: "Reading generation has been initiated." },
        { status: 202, headers: responseHeaders }
      );
    } catch (error) {
      console.error(
        "API daily reading - Error initiating background task:",
        error
      );
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500, headers: responseHeaders }
      );
    }
  } else {
    return NextResponse.json(
      { message: `Method ${req.method} Not Allowed` },
      { status: 405, headers: { Allow: "POST, OPTIONS" } }
    );
  }
}
