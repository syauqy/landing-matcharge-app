import { generateObject } from "ai";
// import { google } from "@ai-sdk/google";
// import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { dailyReadingPrompt, monthlyReadingPrompt } from "@/utils/prompts";
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
        // model: google("gemini-2.5-flash-preview-04-17"),
        model: openai("gpt-4.1-mini-2025-04-14"),
        // model: google("gemini-2.5-flash-preview-05-20"),
        schema: z.object({
          mood: z
            .string()
            .describe("Today's general mood and atmosphere in one sentence")
            .catch(() => ""),
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

      // console.log("resObj", resObj);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          subtitle: resObj?.today,
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

export async function generateMonthlyReading(profile) {
  // supabase client is now an argument
  console.log(profile.id, profile.username);
  const { data: newReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "basic",
      reading_category: "monthly",
      title: "Monthly Reading",
      username: profile.username,
      status: "loading",
      slug: "monthly-reading",
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
        // model: google("gemini-2.5-flash-preview-04-17"),
        model: openai("gpt-4.1-mini-2025-04-14"),
        // model: anthropic("claude-3-haiku-20240307"),
        // model: google("gemini-2.5-flash-preview-05-20"),
        schema: z.object({
          summary: z.object({
            core_theme: z
              .string()
              .describe(
                "What is the dominant, overarching energy or theme of the month based on the prevailing Weton influences? (e.g., A Month of Growth and New Beginnings, A Period of Introspection and Consolidation, Navigating Social Dynamics)."
              )
              .catch(() => ""),
            description: z
              .string()
              .describe("brief description of the month")
              .catch(() => ""),
            keywords: z
              .string()
              .describe(
                `3-5 concise keywords summarizing the month's primary energetic thrust.`
              )
              .catch(() => ""),
            auspicious_scale: z
              .string()
              .describe(
                "A general numerical rating of the month's overall favorability for the user's birth Weton (1=Challenging, 5=Highly Auspicious), with a brief explanation."
              )
              .catch(() => ""),
          }),
          analysis: z.object({
            weton_combination: z
              .string()
              .describe(
                "Identify the most influential Weton combinations that will occur throughout the month (e.g., periods dominated by certain dina or pasaran energies, or significant Weton conjunctions relative to the user's birth Weton). Explain their general characteristics."
              )
              .catch(() => ""),
            fortunate_windows: z
              .string()
              .describe(
                " Highlight 2-3 specific date ranges or individual days within the month that are particularly auspicious for general activities, based on the Weton flow. Briefly explain why they are favorable."
              )
              .catch(() => ""),
            cautious_windows: z
              .string()
              .describe(
                "Identify 2-3 specific date ranges or individual days that may present challenges or require extra caution. Briefly explain why these periods might be difficult."
              )
              .catch(() => ""),
            impact: z
              .string()
              .describe(
                "How do these monthly Weton energies specifically interact with the user's Birth Weton? Are there harmonies, clashes, or unique opportunities presented by this interaction? Reference neptu calculations where relevant."
              )
              .catch(() => ""),
          }),
          guidance: z.object({
            growth: z
              .string()
              .describe(
                "Opportunities for learning, inner work, breaking habits, or cultivating new virtues."
              )
              .catch(() => ""),
            relationship: z
              .string()
              .describe(
                "Dynamics in romantic partnerships, family interactions, friendships, and social networks. Advice on communication, conflict resolution, or deepening bonds."
              )
              .catch(() => ""),
            career: z
              .string()
              .describe(
                "Professional opportunities, challenges at work, financial trends (saving, spending, investing), and career advancement advice."
              )
              .catch(() => ""),
            health: z
              .string()
              .describe(
                "General energy levels, physical and mental health tendencies, and recommendations for self-care, rest, or specific wellness practices."
              )
              .catch(() => ""),
            spiritual: z
              .string()
              .describe(
                "Insights into spiritual reflection, connection to the divine, or finding inner peace according to Javanese principles."
              )
              .catch(() => ""),
          }),
          wisdom: z.object({
            primbon: z
              .string()
              .describe(
                "Briefly cite a relevant traditional primbon interpretation or concept that aligns with the month's overarching theme or specific Weton influences. Explain its meaning for the user. (e.g., a specific pananggalan, sifat weton, or pepali)."
              )
              .catch(() => ""),
            philosophy: z
              .string()
              .describe(
                "Connect the month's Weton energy to a core Javanese philosophical concept (e.g., harmoni, keselarasan, tata krama, memayu hayuning bawana, eling lan waspada). Explain how the user can embody this concept during the month."
              )
              .catch(() => ""),
          }),
        }),
        messages: [{ role: "user", content: monthlyReadingPrompt(profile) }],
      });
      const resObj = response.object;

      // console.log("resObj", resObj);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          subtitle: resObj?.summary?.core_theme,
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
