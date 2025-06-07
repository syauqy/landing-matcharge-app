import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
// import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import {
  dailyReadingPrompt,
  monthlyReadingPrompt,
  primaryTraitsPrompt,
  basicLovePrompt,
} from "@/utils/prompts";
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
        // model: openai("gpt-4.1-mini-2025-04-14"),
        // model: openai("gpt-4.1-nano-2025-04-14"),
        model: google("gemini-2.5-flash-preview-05-20"),
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 100,
            },
          },
        },
        schema: z.object({
          today: z
            .string()
            .describe(
              "Describes and summarize the daily reading of the user weton to today's weton in one sentence"
            )
            .catch(() => ""),
          do: z
            .string()
            .describe(
              "Suggestion on what the user needs to do today in one sentence"
            )
            .catch(() => ""),
          dont: z
            .string()
            .describe(
              "Suggestion on what the user needs to avoid today in one sentence"
            )
            .catch(() => ""),
          fact: z
            .string()
            .describe(
              "A short, interesting fact about the today Weton. Stated in English"
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
        // model: openai("gpt-4.1-mini-2025-04-14"),
        // model: openai("gpt-4.1-nano-2025-04-14"),
        model: google("gemini-2.5-flash-preview-05-20"),
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 500,
            },
          },
        },
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
              .describe(
                "brief description of that summarize the energy of the month"
              )
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

export async function generatePrimaryTraitsReading(profile) {
  // supabase client is now an argument
  console.log(profile.id, profile.username);
  const { data: newReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "basic",
      reading_category: "general_readings",
      title: "Primary Traits",
      subtitle: "Your most prominent strengths and inherent characteristics",
      username: profile.username,
      status: "loading",
      slug: "primary-traits",
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
        // model: openai("gpt-4.1-mini-2025-04-14"),
        // model: openai("gpt-4.1-nano-2025-04-14"),
        // model: anthropic("claude-3-haiku-20240307"),
        model: google("gemini-2.5-flash-preview-05-20"),
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 1000,
            },
          },
        },
        schema: z.object({
          weton_identity: z.object({
            element: z
              .string()
              .describe(
                "Describe the combined elemental and directional symbolism of your dina and pasaran, explaining how this forms your core energetic blueprint."
              )
              .catch(() => ""),
          }),
          characters: z.object({
            laku: z
              .string()
              .describe(
                "Explain the primary Lakune associated with this Weton, Neptu, Laku, Rakam and Wuku. Describe what this signifies about their fundamental character and how they navigate life."
              )
              .catch(() => ""),
            strength: z
              .array(
                z
                  .string()
                  .describe(
                    "Detail 3-5 specific positive personality traits and potentials (e.g., leadership, creativity, empathy, resilience, intellect, loyalty) that are characteristic of this Weton. Provide brief explanations of how these might manifest."
                  )
                  .catch(() => "")
              )
              .max(5),
            growth: z
              .array(
                z
                  .string()
                  .describe(
                    "Outline 2-3 potential challenges or inherent tendencies that, if left unmanaged, could lead to difficulties. Frame these constructively as opportunities for self-mastery (e.g., impatience, stubbornness, overly critical nature, mood swings)."
                  )

                  .catch(() => "")
              )
              .max(3),
          }),
          influences: z.object({
            emotion: z
              .string()
              .describe(
                'Describe typical emotional responses and tendencies (e.g., "prone to intense emotions," "generally calm and collected," "empathetic and sensitive").'
              )
              .catch(() => ""),
            social: z
              .string()
              .describe(
                "How do individuals with this Weton typically interact with others? Are they sociable, reserved, diplomatic, or direct? Mention general relationship compatibility principles without detailing specific Weton pairings."
              )
              .catch(() => ""),
            work: z
              .string()
              .describe(
                'What kind of work ethic or professional approach is common? (e.g., "a natural leader," "meticulous and detail-oriented," "prefers independent work").'
              )
              .catch(() => ""),
            financial: z
              .string()
              .describe(
                'General tendencies related to money and resources (e.g., "tends to attract wealth," "needs discipline in spending," "resourceful").'
              )
              .catch(() => ""),
            health: z
              .string()
              .describe(
                "Broad insights into typical energy levels or areas of physical/mental sensitivity, always with a disclaimer to consult medical professionals for health advice."
              )
              .catch(() => ""),
          }),
          symbol: z.object({
            symbol: z
              .string()
              .describe(
                "If there's a traditional animal, plant, or natural phenomenon associated with this Weton (e.g., Manuk Kuntul), briefly explain its symbolic meaning and how it relates to the user's traits."
              )
              .catch(() => ""),
            philosophy: z
              .string()
              .describe(
                "Briefly reference a relevant primbon concept or pepali (Javanese proverb/admonition) that encapsulates a core truth about this Weton's character."
              )
              .catch(() => ""),
          }),
          wisdom: z.object({
            reflection: z
              .string()
              .describe(
                "Offer a prompt for the user to reflect on their inherent traits and how they can consciously work with them."
              )
              .catch(() => ""),
            empowerment: z
              .string()
              .describe(
                "A concluding statement encouraging the user to embrace their unique Weton characteristics for personal growth and fulfillment."
              )
              .catch(() => ""),
          }),
        }),
        messages: [{ role: "user", content: primaryTraitsPrompt(profile) }],
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

export async function generateLoveBasicReading(profile) {
  // supabase client is now an argument
  console.log(profile.id, profile.username);
  const { data: newLoveBasicReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "basic",
      reading_category: "love_readings",
      title: "Your Love",
      subtitle:
        "Explore the core of how your Weton shapes your approach to love and partnership",
      username: profile.username,
      status: "loading",
      slug: "love-core",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newLoveBasicReading);

  const { data: newLoveStyleReading, errorLoveStyle } = await supabase
    .from("readings")
    .insert({
      reading_type: "basic",
      reading_category: "love_readings",
      title: "Love Style",
      subtitle:
        "Discover your natural way of expressing and receiving affection in relationships.",
      username: profile.username,
      status: "loading",
      slug: "love-style",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorLoveStyle) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newLoveStyleReading);

  const { data: newLoveAttitudesReading, errorLoveAttitudes } = await supabase
    .from("readings")
    .insert({
      reading_type: "basic",
      reading_category: "love_readings",
      title: "Love Attitudes",
      subtitle:
        "Uncover your underlying beliefs and perspectives when it comes to romance.",
      username: profile.username,
      status: "loading",
      slug: "love-attitudes",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorLoveAttitudes) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newLoveAttitudesReading);

  const maxAttempts = 2;
  let attempt = 0;
  let lastErrorMsg = "";
  do {
    attempt++;
    try {
      const response = await generateObject({
        model: google("gemini-2.5-flash-preview-05-20"),
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 1000,
            },
          },
        },
        schema: z.object({
          love_core: z.object({
            romantic_archetype: z
              .string()
              .describe(
                'Based on the interplay of your core birth elements, describe your fundamental "essence" or "archetype" in love. Are you inherently a nurturing partner, an adventurous companion, a stable anchor, a passionate lover, a spiritual seeker in relationships, or something else?'
              )
              .catch(() => ""),
            emotional_foundation: z
              .string()
              .describe(
                "How do your birth Weton and Wuku influence your emotional needs within a relationship? What kind of emotional environment do you naturally seek or create?"
              )
              .catch(() => ""),
            interpersonal_instincts: z
              .string()
              .describe(
                'How do your Rakam and Sadwara shape your innate social grace and the way you navigate the "give and take" of a partnership? Do you prioritize harmony, intellectual connection, shared values, or mutual growth?'
              )
              .catch(() => ""),
            underlying_drives: z
              .string()
              .describe(
                "What are the deep-seated, perhaps unconscious, drives or patterns (influenced by your Saptawara and Laku) that shape your interactions and expectations in love? (e.g., a drive for security, freedom, passion, understanding, or a desire to serve)."
              )
              .catch(() => ""),
            philosophy: z
              .string()
              .describe(
                "Connect your core approach to love with a relevant Javanese philosophical concept (e.g., keselarasan (harmony), golong gilig (unity of purpose), memayu hayuning bawana (preserving the beauty of the world, often through relational balance))."
              )
              .catch(() => ""),
          }),
          love_style: z.object({
            primary_expression: z
              .string()
              .describe(
                "How do you naturally show love and care to a partner? (e.g., through acts of service (pengabdian), gentle words (ucapan lembut), thoughtful gestures (perhatian), creating shared experiences (kebersamaan), or practical support (bantuan nyata))."
              )
              .catch(() => ""),
            desired_affection: z
              .string()
              .describe(
                "How do you primarily wish to receive love from a partner? What makes you feel most cherished and secure in a relationship?"
              )
              .catch(() => ""),
            romantic_ideal: z
              .string()
              .describe(
                "What kind of romantic experience or partner do you inherently yearn for or seek out? Is it a profound spiritual connection, an exciting adventure, a deeply stable home life, or a dynamic intellectual exchange?"
              )
              .catch(() => ""),
            demonstration_of_passion: z
              .string()
              .describe(
                "How does your Weton influence the way you express passion or romantic intensity? Are you overtly passionate, subtly devoted, or express love through unwavering loyalty?"
              )
              .catch(() => ""),
            cultural_nuance: z
              .string()
              .describe(
                "Briefly touch upon any specific Javanese cultural expectations or interpretations of love expression that might resonate with your Weton (e.g., tata krama in affection, the importance of sabar and ikhlas in love)."
              )
              .catch(() => ""),
          }),
          love_attitudes: z.object({
            commitment: z
              .string()
              .describe(
                "What is your intrinsic perspective on commitment and long-term relationships? Do you see them as a sacred bond, a practical partnership, a journey of shared growth, or something that requires careful negotiation of freedom?"
              )
              .catch(() => ""),
            conflict: z
              .string()
              .describe(
                "How do you typically tend to handle disagreements or challenges in a relationship? (e.g., by seeking harmony and compromise, through direct and frank communication, by needing space, or by seeking understanding first)."
              )
              .catch(() => ""),
            trust: z
              .string()
              .describe(
                "What are your inherent tendencies and values regarding trust, loyalty, and fidelity within a partnership? What builds trust for you, and what erodes it?"
              )
              .catch(() => ""),
            interdependence: z
              .string()
              .describe(
                "How do you naturally balance your personal autonomy and need for individual space with the desire for relational closeness and shared life? Do you lean towards being more independent, highly interdependent, or is it a constant dance?"
              )
              .catch(() => ""),
            harmony: z
              .string()
              .describe(
                "Emphasize how the concept of keselarasan (harmony) might manifest in your attitudes towards resolving differences and maintaining peace in a relationship, given your Weton influences."
              )
              .catch(() => ""),
          }),
        }),
        messages: [{ role: "user", content: basicLovePrompt(profile) }],
      });
      const resObj = response.object;

      // console.log("resObj", resObj);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.love_core,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLoveBasicReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.love_style,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLoveStyleReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.love_attitudes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLoveAttitudesReading.id);
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
