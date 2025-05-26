import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { dailyReadingPrompt } from "@/utils/prompts";
import { z } from "zod";
import { supabase } from "@/utils/supabaseClient";

export async function generateDailyReading(profile) {
  // supabase client is now an argument
  console.log(profile.id, profile.username);
  const { data: newReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "basic",
      reading_category: "daily",
      title: "Daily Reading",
      username: profile.username,
      status: "loading",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newReading);

  const maxAttempts = 2;
  let attempt = 0;
  let lastErrorMsg = "";
  do {
    attempt++;
    try {
      const response = await generateObject({
        model: google("gemini-2.5-flash-preview-04-17"),
        schema: z.object({
          //   weton: z
          //     .string()
          //     .describe(
          //       "Today's weton (eg. Monday Kliwon, Thursday Legi). State dina/day in english"
          //     )
          //     .catch(() => ""),
          //   energy: z
          //     .string()
          //     .describe(
          //       "Today's weton inherent energetic qualities in one sentence"
          //     )
          //     .catch(() => ""),
          mood: z
            .string()
            .describe("Today's general mood and atmosphere in one sentence")
            .catch(() => ""),
          //   auspicious: z
          //     .string()
          //     .describe(
          //       "Describes and summarize the daily reading in one sentence"
          //     )
          //     .catch(() => ""),
          today: z
            .string()
            .describe(
              "Describes and summarize the daily reading of the user weton to today's weton in one sentence"
            )
            .catch(() => ""),
          do: z
            .string()
            .describe(
              "Give a suggestion on what the user needs to do today in one sentence"
            )
            .catch(() => ""),
          dont: z
            .string()
            .describe(
              "Give a suggestion on what the user needs to avoid today in one sentence"
            )
            .catch(() => ""),
          fact: z
            .string()
            .describe(
              "A small, interesting fact about the today Weton. Stated in English"
            )
            .catch(() => ""),
          weton: z
            .string()
            .describe("Today's weton in english")
            .catch(() => ""),
        }),
        messages: [{ role: "user", content: dailyReadingPrompt(profile) }],
      });
      const resObj = response.object;

      console.log("resObj", resObj);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newReading.id);
      break;
    } catch (error) {
      lastErrorMsg = error.message;
      console.error(`Attempt ${attempt} failed:`, lastErrorMsg);
      if (attempt >= maxAttempts) {
        await supabase
          .from("readings")
          .update({
            status: "error",
            reading: { error: lastErrorMsg },
            updated_at: new Date().toISOString(),
          })
          .eq("id", newReading.id);
      }
    }
  } while (attempt < maxAttempts);
}
