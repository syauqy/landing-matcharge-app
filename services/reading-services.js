import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { createClient } from "@/utils/supabase/server-props";
// import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import {
  dailyReadingPrompt,
  monthlyReadingPrompt,
  primaryTraitsPrompt,
  basicLovePrompt,
  proLovePrompt,
  proGeneralCalculationPrompt,
  proGeneralCalculationPrompt2,
  proCareerPrompt,
  proFinancialPrompt,
  proLoveCompatibilityPrompt,
  proCoupleCompatibilityPrompt,
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
              "Describes and summarize the daily reading of the user weton to today's weton in one sentence based on local timezone"
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
            .describe("Today's weton in english based on local timezone")
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
                "Brief description of that summarize the energy of the month"
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
            fortunate_windows: z
              .string()
              .describe(
                "Highlight 2-3 specific date ranges or individual days within the month that are particularly auspicious for general activities, based on the Weton flow. Briefly explain why they are favorable."
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
            philosophy: z
              .string()
              .describe(
                "Connect the month's Weton and Wuku energy to a core Javanese philosophical concept (e.g., harmoni, keselarasan, tata krama, memayu hayuning bawana, eling lan waspada). Explain how the user can embody this concept during the month."
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
  console.log("Starting AI generation process...");
  const startTime = process.hrtime.bigint();

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
                "Explain the primary Laku associated with this Weton, Neptu, Laku, Rakam and Wuku. Describe what this signifies about their fundamental character and how they navigate life."
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

      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      console.log(`Total AI Generation Logic took: ${durationMs}ms`);
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
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLoveStyleReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.love_attitudes,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
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
          .eq("id", newLoveBasicReading.id);
      }
    }
  } while (attempt < maxAttempts);
}

export async function generateLoveProReading(profile) {
  const { data: newLoveAttachmentReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "love_readings",
      title: "Attachment Style",
      subtitle:
        "Gain insight into how you form bonds and connect emotionally with partners",
      username: profile.username,
      status: "loading",
      slug: "attachment-style",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newLoveAttachmentReading);

  const { data: newLoveOfferReading, errorOffer } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "love_readings",
      title: "What You Can Offer",
      subtitle:
        "Identify the unique strengths and gifts you bring to a loving relationship",
      username: profile.username,
      status: "loading",
      slug: "your-offer",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorOffer) {
    console.error("Error inserting new reading:", errorOffer);
    throw error;
  }

  console.log("new reading generated on supabase", newLoveOfferReading);

  const { data: newLoveCompatibleReading, errorCompatible } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "love_readings",
      title: "Compatible With",
      subtitle:
        "Learn about Weton energies that naturally harmonize with your own in love",
      username: profile.username,
      status: "loading",
      slug: "love-compatibility",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorCompatible) {
    console.error("Error inserting new reading:", errorCompatible);
    throw error;
  }

  console.log("new reading generated on supabase", newLoveCompatibleReading);

  const { data: newLoveIncompatibleReading, errorIncompatible } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "love_readings",
      title: "Incompatible With",
      subtitle:
        "Understand potential energetic clashes and challenges with other Wetons in relationships",
      username: profile.username,
      status: "loading",
      slug: "love-incompatibility",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorIncompatible) {
    console.error("Error inserting new reading:", errorIncompatible);
    throw error;
  }

  console.log("new reading generated on supabase", newLoveIncompatibleReading);

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
          attachment_style: z.object({
            core_bonding: z
              .string()
              .describe(
                "Based on your Weton and Laku, what is your primary disposition towards closeness and emotional connection? Do you naturally lean towards seeking deep fusion, valuing independence, needing reassurance, or balancing both? Describe this tendency."
              )
              .catch(() => ""),
            comfort: z
              .string()
              .describe(
                "How does your Weton influence your comfort levels with deep intimacy, emotional sharing, and vulnerability in a relationship? Are you naturally open, cautious, or do you prefer a more guarded approach?"
              )
              .catch(() => ""),
            response: z
              .string()
              .describe(
                "How do you typically react when a partner needs space or when there's a perceived distance in the relationship? (e.g., do you seek more connection, withdraw, or use the time for personal reflection?)"
              )
              .catch(() => ""),
            dependency: z
              .string()
              .describe(
                "Describe your natural leanings regarding dependency within a partnership. Do you tend to be more independent, deeply interdependent, or do you find yourself needing reassurance or space?"
              )
              .catch(() => ""),
            mutual_completion: z
              .string()
              .describe(
                "Connect your attachment style to the Javanese concept of saling melengkapi, explaining how your specific bonding tendencies contribute to or seek this sense of mutual completion in a partnership."
              )
              .catch(() => ""),
          }),
          your_offer: z.object({
            key_positive: z
              .string()
              .describe(
                "List and describe 3-5 of your most significant innate gifts or strengths that you bring to a partnership. These should be framed as valuable assets (e.g., unwavering loyalty, deep emotional support, intellectual stimulation, practical stability, adventurous spirit, spiritual depth, calming presence, keen discernment)."
              )
              .catch(() => ""),
            impact: z
              .string()
              .describe(
                "Explain how these specific Weton-derived qualities positively influence your partner's life or the overall relationship dynamic. How do you enrich the connection?"
              )
              .catch(() => ""),
            tendency: z
              .string()
              .describe(
                "How does your Weton shape your capacity for nurturing, supporting, and caring for a partner? What kind of care do you instinctively provide?"
              )
              .catch(() => ""),
            approach: z
              .string()
              .describe(
                "What unique approach or quality do you bring when facing challenges or problems within the relationship? (e.g., calm analysis, fiery determination, diplomatic mediation, patient endurance)."
              )
              .catch(() => ""),
            responsibility: z
              .string()
              .describe(
                "Relate your contributions to the Javanese concept of responsibility in relationships, showing how your innate traits empower you to uphold your responsibilities and commitments."
              )
              .catch(() => ""),
          }),
          compatible: z.object({
            harmony: z
              .string()
              .describe(
                "Describe the general characteristics of Weton types that naturally create a harmonious energetic dynamic with your own. This might involve similar or complementary elemental energies, neptu balances, or Laku styles."
              )
              .catch(() => ""),
            values: z
              .string()
              .describe(
                "Identify broader Weton categories or qualities that suggest a shared outlook on life, similar core values, or a comparable approach to relationships, which foster compatibility."
              )
              .catch(() => ""),
            growth: z
              .string()
              .describe(
                "Mention Weton types that, while not necessarily 'easy,' offer opportunities for significant mutual growth and balance through complementary energies."
              )
              .catch(() => ""),
            dynamic: z
              .string()
              .describe(
                'Briefly explain why these compatibilities exist (e.g., "They offer stability to your adventurous spirit," "Their calm nature balances your fiery passion," "You both value spiritual growth").'
              )
              .catch(() => ""),
            soulmate: z
              .string()
              .describe(
                "Briefly touch upon how these compatible Weton patterns might align with the traditional Javanese understanding of soulmate, emphasizing that it's about alignment and effort, not just fate."
              )
              .catch(() => ""),
          }),
          incompatible: z.object({
            clashes: z
              .string()
              .describe(
                "Describe the general characteristics of Weton types that might create inherent energetic friction or significant differences with your own. This could involve opposing elemental energies, neptu imbalances, or Laku styles that lead to natural friction."
              )
              .catch(() => ""),
            dissimilarities: z
              .string()
              .describe(
                "Identify broader Weton categories or qualities that suggest a likelihood of conflicting values, vastly different life approaches, or opposing communication styles, which could lead to misunderstandings."
              )
              .catch(() => ""),
            challenges: z
              .string()
              .describe(
                'Briefly explain why these potential incompatibilities exist (e.g., "Their independent nature might clash with your need for constant connection," "Their directness could be abrasive to your sensitive disposition," "You might find their approach to finances too different from your own").'
              )
              .catch(() => ""),
            guidance: z
              .string()
              .describe(
                'For these challenging pairings, offer constructive advice on how to navigate potential difficulties with awareness, patience, communication, and conscious effort, emphasizing that "incompatible" does not mean "impossible."'
              )
              .catch(() => ""),
            mindfulness: z
              .string()
              .describe(
                "Connect this section to the Javanese wisdom of eling lan waspada, suggesting that awareness of potential challenges allows for proactive and mindful relationship building."
              )
              .catch(() => ""),
          }),
        }),
        messages: [{ role: "user", content: proLovePrompt(profile) }],
      });
      const resObj = response.object;

      // console.log("resObj", resObj);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.attachment_style,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLoveAttachmentReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.your_offer,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLoveOfferReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.compatible,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLoveCompatibleReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.incompatible,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLoveIncompatibleReading.id);
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
          .eq("id", newLoveAttachmentReading.id);
      }
    }
  } while (attempt < maxAttempts);
}

export async function generateGeneralProReading(profile) {
  const { data: newRakamReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "general_readings",
      title: "Rakam",
      subtitle:
        "Uncover the significant life themes or karmic imprints shaping your experiences",
      username: profile.username,
      status: "loading",
      slug: "rakam",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newRakamReading);

  const { data: newSadwaraReading, errorSadwara } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "general_readings",
      title: "Sadwara",
      subtitle:
        "Explore the subtle behavioral tendencies influenced by the six-day Pawukon cycle",
      username: profile.username,
      status: "loading",
      slug: "sadwara",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorSadwara) {
    console.error("Error inserting new reading:", errorSadwara);
    throw error;
  }

  console.log("new reading generated on supabase", newSadwaraReading);

  const { data: newSaptawaraReading, errorSaptawara } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "general_readings",
      title: "Character & Traits",
      subtitle:
        "Reveal the core pillar of your inner foundation and its potential influenced by the seven-day Pawukon cycle",
      username: profile.username,
      status: "loading",
      slug: "saptawara",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorSaptawara) {
    console.error("Error inserting new reading:", errorSaptawara);
    throw error;
  }

  console.log("new reading generated on supabase", newSaptawaraReading);

  const { data: newHastawaraReading, errorHastawara } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "general_readings",
      title: "Hastawara",
      subtitle:
        "Understand the specific fortunes and challenges guided by the eight-day cycle influence",
      username: profile.username,
      status: "loading",
      slug: "hastawara",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorHastawara) {
    console.error("Error inserting new reading:", errorHastawara);
    throw error;
  }

  console.log("new reading generated on supabase", newHastawaraReading);

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
              thinkingBudget: 2000,
            },
          },
        },
        schema: z.object({
          rakam: z.object({
            core_meaning: z
              .string()
              .describe(
                'Explain the literal or metaphorical meaning of this Rakam (e.g., "Macan Ketawan" meaning "Caught Tiger," and its symbolic implications).'
              )
              .catch(() => ""),
            character: z
              .string()
              .describe(
                "Detail the inherent strengths and potential challenges/areas for self-awareness associated with this Rakam. Provide specific personality traits."
              )
              .catch(() => ""),
            influence: z
              .string()
              .describe(
                "Describe how this Rakam impacts your general fortune, social interactions, and public perception or reputation."
              )
              .catch(() => ""),
            wisdom: z
              .string()
              .describe(
                "Offer a relevant Javanese proverb (pepali) or traditional wisdom specifically associated with this Rakam, followed by actionable guidance on how to embrace its strengths and navigate its complexities for a more harmonious life."
              )
              .catch(() => ""),
          }),
          sadwara: z.object({
            core_meaning: z
              .string()
              .describe(
                'Explain the symbolic meaning or core characteristic associated with this Sadwara (e.g., "Tungle" meaning "Leaf," and its practical implications).'
              )
              .catch(() => ""),
            character: z
              .string()
              .describe(
                "Detail your practical tendencies, general energy levels, and any specific spiritual inclinations or needs associated with this Sadwara."
              )
              .catch(() => ""),
            influence: z
              .string()
              .describe(
                "Describe how this Sadwara subtly influences your routine, work ethic, and everyday interactions with others."
              )
              .catch(() => ""),
            wisdom: z
              .string()
              .describe(
                "Suggest a traditional Javanese practice or a contemplative approach that resonates with the energy of this Sadwara, offering actionable advice for optimizing daily living and spiritual connection."
              )
              .catch(() => ""),
          }),
          saptawara: z.object({
            character: z
              .string()
              .describe(
                'Detail the fundamental temperament and key symbolic associations (e.g., "Bumi Kapetak" or "Cultivated Earth")'
              )
              .catch(() => ""),
            strenghts: z
              .string()
              .describe(
                "Outline the primary positive traits and potential areas for growth or caution that are characteristic of individual."
              )
              .catch(() => ""),
            influence: z
              .string()
              .describe(
                "Describe how this traits generally influences your life path, ambition, or overarching sense of purpose."
              )
              .catch(() => ""),
            wisdom: z
              .string()
              .describe(
                "Offer actionable advice on how you can align with and best leverage the inherent energies of your character for personal well-being, success, and fulfilling your life's path."
              )
              .catch(() => ""),
          }),
          hastawara: z.object({
            core_attributes: z
              .string()
              .describe(
                "Describe the general characteristics of Weton types that might create inherent energetic friction or significant differences with your own. This could involve opposing elemental energies, neptu imbalances, or Laku styles that lead to natural friction."
              )
              .catch(() => ""),
            impact: z
              .string()
              .describe(
                "Describe the general auspicious or inauspicious qualities associated with this Hastawara, providing examples of activities that are traditionally favored or disfavored under its influence."
              )
              .catch(() => ""),
            connection: z
              .string()
              .describe(
                "Offer any relevant traditional Primbon interpretations, warnings, or blessings tied to this particular Hastawara."
              )
              .catch(() => ""),
            wisdom: z
              .string()
              .describe(
                "Provide actionable advice on how you can leverage awareness of your Hastawara's influence to make more conscious choices, navigate subtle life energies, and optimize your actions."
              )
              .catch(() => ""),
          }),
        }),
        messages: [
          { role: "user", content: proGeneralCalculationPrompt(profile) },
        ],
      });
      const resObj = response.object;

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.rakam,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newRakamReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.sadwara,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newSadwaraReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.saptawara,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newSaptawaraReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.hastawara,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newHastawaraReading.id);
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
          .eq("id", newRakamReading.id);
      }
    }
  } while (attempt < maxAttempts);
}

export async function generateGeneralProReading2(profile) {
  const { data: newLakuReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "general_readings",
      title: "Laku",
      subtitle:
        "Discover the archetype and behavioral pattern that guides your life's journey.",
      username: profile.username,
      status: "loading",
      slug: "laku",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newLakuReading);

  const { data: newValuesReading, errorValues } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "general_readings",
      title: "Values",
      subtitle:
        "Pinpoint the core principles that drive your decisions and motivations.",
      username: profile.username,
      status: "loading",
      slug: "values",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorValues) {
    console.error("Error inserting new reading:", errorValues);
    throw error;
  }

  console.log("new reading generated on supabase", newValuesReading);

  const { data: newInteractionStyle, errorInteraction } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "general_readings",
      title: "Interaction Style",
      subtitle:
        "Learn how you naturally connect and communicate with the world around you.",
      username: profile.username,
      status: "loading",
      slug: "interaction-style",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorInteraction) {
    console.error("Error inserting new reading:", errorInteraction);
    throw error;
  }

  console.log("new reading generated on supabase", newInteractionStyle);

  const { data: newLifePathReading, errorLifePath } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "general_readings",
      title: "Life Path",
      subtitle:
        "Get insights into the themes and directions of your life's journey.",
      username: profile.username,
      status: "loading",
      slug: "life-path",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorLifePath) {
    console.error("Error inserting new reading:", errorLifePath);
    throw error;
  }

  console.log("new reading generated on supabase", newLifePathReading);

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
              thinkingBudget: 2000,
            },
          },
        },
        schema: z.object({
          laku: z.object({
            core_meaning: z
              .string()
              .describe(
                'Explain the metaphorical meaning of this specific Laku and its core characteristics. For "Lakune Lintang," for example, describe qualities like a tendency towards solitude or quiet strength, often admired but not always socially outgoing.'
              )
              .catch(() => ""),
            strengths: z
              .string()
              .describe(
                "Detail the natural positive qualities that stem from this Laku (e.g., resilience, deep thought, independence, charisma, adaptability, diligence)."
              )
              .catch(() => ""),
            challenges: z
              .string()
              .describe(
                "Outline the potential pitfalls or areas where awareness and conscious effort are needed (e.g., tendency towards isolation, impatience, moodiness, too much reliance on self)."
              )
              .catch(() => ""),
            influence: z
              .string()
              .describe(
                "How does this Laku shape your general approach to daily life, decision-making, and facing adversity?"
              )
              .catch(() => ""),
            wisdom: z
              .string()
              .describe(
                "Offer actionable guidance on how to best embody the positive aspects of your Laku and mitigate its challenges, perhaps with a relevant Javanese proverb or a spiritual reflection."
              )
              .catch(() => ""),
          }),
          values: z.object({
            primary_value: z
              .string()
              .describe(
                "Identify and describe the dominant 2-3 core values that are most pronounced in your Weton combination (e.g., harmony (keselarasan), responsibility (tanggung jawab), sincerity (ikhlas), humility (andhap asor), collective well-being (memayu hayuning bawana), honesty (kejujuran), perseverance (tekun), wisdom (kawicaksanan))."
              )
              .catch(() => ""),
            manifest: z
              .string()
              .describe(
                "Explain how these values are likely to manifest in your daily behavior, relationships, and professional life. Provide concrete examples."
              )
              .catch(() => ""),
            motivation: z
              .string()
              .describe(
                "What truly drives your actions and aspirations, according to your Weton influences?"
              )
              .catch(() => ""),
            conflicts: z
              .string()
              .describe(
                "Briefly touch upon any inherent tensions between different values or how external pressures might challenge your core principles, and how your Weton suggests navigating these."
              )
              .catch(() => ""),
            philosophy: z
              .string()
              .describe(
                "Connect your core values to broader Javanese philosophical concepts or ethical guidelines, explaining their significance in a traditional context."
              )
              .catch(() => ""),
          }),
          interaction_style: z.object({
            social_tendency: z
              .string()
              .describe(
                "Are you naturally more introverted or extroverted? Direct or indirect in communication? Preferring harmony over confrontation, or vice-versa? Describe your overarching social tendency."
              )
              .catch(() => ""),
            communication: z
              .string()
              .describe(
                "Detail your typical communication style (e.g., articulate, reserved, expressive, pragmatic, empathetic, logical). How do you tend to convey your thoughts and feelings?"
              )
              .catch(() => ""),
            relationship: z
              .string()
              .describe(
                "How do you typically initiate, maintain, and navigate friendships, professional connections, and community ties? Are you a leader, a supportive follower, a mediator, or an independent contributor?"
              )
              .catch(() => ""),
            social_dynamics: z
              .string()
              .describe(
                "How do you typically react to social challenges, group pressures, or differing opinions?"
              )
              .catch(() => ""),
            social_etiquette: z
              .string()
              .describe(
                "Connect aspects of your interaction style to relevant Javanese tata krama (etiquette) or social norms, explaining how your Weton might naturally align with or challenge these traditions."
              )
              .catch(() => ""),
          }),
          life_path: z.object({
            fortune: z
              .string()
              .describe(
                'Describe the general "flavor" of your life path. Is it one of steady growth, unexpected turns, a focus on spiritual development, material abundance, or perhaps a path of service?'
              )
              .catch(() => ""),
            theme: z
              .string()
              .describe(
                "Identify recurring themes or lessons that may appear throughout your life (e.g., learning resilience, cultivating wisdom, building community, navigating change, finding balance, pursuing creative expression, overcoming adversity)."
              )
              .catch(() => ""),
            flow: z
              .string()
              .describe(
                "Where might you find life tends to unfold more easily or where opportunities naturally arise?"
              )
              .catch(() => ""),
            challenge: z
              .string()
              .describe(
                "Where might you encounter recurring lessons or challenges that serve as catalysts for personal development?"
              )
              .catch(() => ""),
            wheel_of_life: z
              .string()
              .describe(
                "Frame your life path within the Javanese concept of Cakra Manggilingan (the turning wheel of life), suggesting that understanding your Weton offers insight into the rhythm and nature of your unique journey."
              )
              .catch(() => ""),
            outlook: z
              .string()
              .describe(
                "Conclude with an empowering message, emphasizing that while your Weton provides a map, your conscious choices and actions ultimately shape your destiny."
              )
              .catch(() => ""),
          }),
        }),
        messages: [
          { role: "user", content: proGeneralCalculationPrompt2(profile) },
        ],
      });
      const resObj = response.object;

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.laku,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLakuReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.values,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newValuesReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.interaction_style,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newInteractionStyle.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.life_path,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newLifePathReading.id);
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
          .eq("id", newLakuReading.id);
      }
    }
  } while (attempt < maxAttempts);
}

export async function generateCareerProReading(profile) {
  const { data: newCareerReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "work_readings",
      title: "Your Career",
      subtitle:
        "Explore professions and work styles that resonate with your Weton's energy.",
      username: profile.username,
      status: "loading",
      slug: "your-career",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newCareerReading);

  const { data: newIdealLifeReading, errorIdealLife } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "work_readings",
      title: "Ideal Life",
      subtitle:
        "Envision the life that truly fulfills your potential and deepest aspirations.",
      username: profile.username,
      status: "loading",
      slug: "ideal-life",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorIdealLife) {
    console.error("Error inserting new reading:", errorIdealLife);
    throw error;
  }

  console.log("new reading generated on supabase", newIdealLifeReading);

  const { data: newKeyLifeReading, errorKeyLife } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "work_readings",
      title: "Key Life Themes",
      subtitle:
        "Identify potential pivotal moments and themes that may shape your journey.",
      username: profile.username,
      status: "loading",
      slug: "key-life",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorKeyLife) {
    console.error("Error inserting new reading:", errorKeyLife);
    throw error;
  }

  console.log("new reading generated on supabase", newKeyLifeReading);

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
              thinkingBudget: 2000,
            },
          },
        },
        schema: z.object({
          career: z.object({
            strengths: z
              .string()
              .describe(
                "Detail 3-5 specific qualities that make you effective in a professional setting (e.g., natural leadership, meticulous attention to detail, strong collaborative spirit, innovative thinking, resilience under pressure, excellent communication). Provide examples of how these might manifest."
              )
              .catch(() => ""),
            ideal_work: z
              .string()
              .describe(
                "Describe the types of professional settings or industries where your Weton suggests you would feel most aligned and productive (e.g., independent work, team-based projects, creative fields, structured corporate environments, service-oriented roles, entrepreneurial ventures)."
              )
              .catch(() => ""),
            leadership: z
              .string()
              .describe(
                "How do you naturally approach leadership and working with others? Are you a visionary leader, a supportive team player, a meticulous manager, or an inspiring mentor?"
              )
              .catch(() => ""),
            challenges: z
              .string()
              .describe(
                "Identify any inherent tendencies that might present obstacles in your career path (e.g., impatience, aversion to routine, difficulty with authority, sensitivity to criticism). Offer guidance on how to navigate these."
              )
              .catch(() => ""),
            financial_approach: z
              .string()
              .describe(
                "Briefly touch upon your Weton's influence on your general approach to earning and managing wealth."
              )
              .catch(() => ""),
            makarya: z
              .string()
              .describe(
                "Connect your career insights to the Javanese concept of makarya or jembar rejeki (abundant sustenance), emphasizing the importance of effort and alignment with your inherent nature."
              )
              .catch(() => ""),
          }),
          ideal_life: z.object({
            fulfillment: z
              .string()
              .describe(
                "Describe what constitutes your unique vision of a fulfilling life. Is it rooted in spiritual growth, strong family bonds, creative expression, community service, adventurous experiences, intellectual mastery, or financial freedom?"
              )
              .catch(() => ""),
            peace: z
              .string()
              .describe(
                "Based on your Weton, identify the key elements or practices that are essential for you to achieve and maintain ayem tentrem (peace and tranquility) in your daily existence."
              )
              .catch(() => ""),
            priorities: z
              .string()
              .describe(
                "What are the fundamental areas of life (e.g., family, self-development, community, spiritual practice, work, leisure) that your Weton suggests should be prioritized for your overall well-being and sense of meaning?"
              )
              .catch(() => ""),
            authentic: z
              .string()
              .describe(
                "Discuss how living in alignment with your inherent Weton traits is crucial for realizing your ideal life, perhaps linking to concepts like urip kang murub (a life that glows) or mikul dhuwur mendhem jero (upholding virtues, burying flaws)."
              )
              .catch(() => ""),
            auspicious: z
              .string()
              .describe(
                "Suggest types of environments or pursuits that would naturally support your journey towards your ideal life."
              )
              .catch(() => ""),
          }),
          key_life: z.object({
            trajectory: z
              .string()
              .describe(
                "Describe the general 'flavor' or dominant journey theme of your life path (e.g., a journey of continuous learning, consistent growth, navigating frequent changes, finding stability, or experiencing profound transformations)."
              )
              .catch(() => ""),
            predominant: z
              .string()
              .describe(
                "Identify the kinds of significant events or challenges you may recurrently encounter (e.g., opportunities for major career shifts, significant relationship milestones, periods requiring deep introspection, unexpected travel, tests of resilience, periods of abundant harvest, or calls to spiritual deepening)."
              )
              .catch(() => ""),
            cycles: z
              .string()
              .describe(
                "Based on the interplay of your Weton and Wuku cycles, suggest periods that might naturally be more conducive to active pursuit (growth) versus those better suited for reflection and consolidation (rest)."
              )
              .catch(() => ""),
            lessons: z
              .string()
              .describe(
                "Discuss the potential lessons or transformations that often accompany these key life themes, highlighting how they contribute to your overall development."
              )
              .catch(() => ""),
            destiny: z
              .string()
              .describe(
                "Frame these insights within the Javanese philosophical understanding of takdir (what is given) and usaha (what is cultivated through effort), empowering the user to actively engage with their life path."
              )
              .catch(() => ""),
            transitions: z
              .string()
              .describe(
                "Offer general guidance on how to approach major life transitions with awareness and wisdom, drawing from the resilience or adaptability suggested by your Weton elements."
              )
              .catch(() => ""),
          }),
        }),
        messages: [{ role: "user", content: proCareerPrompt(profile) }],
      });
      const resObj = response.object;

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.career,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newCareerReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.ideal_life,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newIdealLifeReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.key_life,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newKeyLifeReading.id);
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
          .eq("id", newCareerReading.id);
      }
    }
  } while (attempt < maxAttempts);
}

export async function generateFinancialProReading(profile) {
  const { data: newCareerReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "financial_readings",
      title: "Your Career",
      subtitle:
        "Explore professions and work styles that resonate with your Weton's energy.",
      username: profile.username,
      status: "loading",
      slug: "your-career",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newCareerReading);

  const { data: newFinancialCyclesReading, errorFinancialCycles } =
    await supabase
      .from("readings")
      .insert({
        reading_type: "pro",
        reading_category: "financial_readings",
        title: "Financial Cycles",
        subtitle:
          "Understand insights into the cyclical nature of your financial fortunes.",
        username: profile.username,
        status: "loading",
        slug: "financial-cycles",
        user_id: profile.id,
      })
      .select()
      .maybeSingle();

  if (errorFinancialCycles) {
    console.error("Error inserting new reading:", errorFinancialCycles);
    throw error;
  }

  console.log("new reading generated on supabase", newFinancialCyclesReading);

  const { data: newWealthPurposeReading, errorWealthPurpose } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "financial_readings",
      title: "Wealth Through Purpose",
      subtitle:
        "Explores how your Weton impacting financial prosperity and personal fulfillment.",
      username: profile.username,
      status: "loading",
      slug: "wealth-purpose",
      user_id: profile.id,
    })
    .select()
    .maybeSingle();

  if (errorWealthPurpose) {
    console.error("Error inserting new reading:", errorWealthPurpose);
    throw error;
  }

  console.log("new reading generated on supabase", newWealthPurposeReading);

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
              thinkingBudget: 2000,
            },
          },
        },
        schema: z.object({
          financial: z.object({
            introduction: z
              .string()
              .describe(
                "Explain how your Weton and Rakam provide insights into your fundamental financial character, including your innate relationship with money, and general tendencies towards abundance or careful management."
              )
              .catch(() => ""),
            mindset: z
              .string()
              .describe(
                "Describe your natural approach to earning, saving, and spending. Are you typically a natural accumulator, a generous giver, a careful planner, or someone who tends to take more risks?"
              )
              .catch(() => ""),
            tendencies: z
              .string()
              .describe(
                "Discuss your overall predisposition towards attracting or managing financial resources. This isn't about specific amounts, but about the flow of wealth in your life."
              )
              .catch(() => ""),
            opportunities: z
              .string()
              .describe(
                "Identify the general avenues or approaches through which you are most likely to find financial opportunities (e.g., through diligent work, networking, specific talents, or by helping others)."
              )
              .catch(() => ""),
            pitfalls: z
              .string()
              .describe(
                "Outline any inherent tendencies that might lead to financial challenges or require careful management (e.g., impulsive spending, excessive generosity, aversion to financial planning, periods of unexpected fluctuation)."
              )
              .catch(() => ""),
            abundant: z
              .string()
              .describe(
                "Connect your financial insights to the Javanese concept of jembar rejeki, emphasizing how mindful living and alignment with your Weton can foster greater abundance."
              )
              .catch(() => ""),
          }),
          cycles: z.object({
            introduction: z
              .string()
              .describe(
                "Explain how Javanese calendrical systems, particularly Wuku cycles and daily Weton movements, offer unique insights into the ebb and flow of financial energies, guiding auspicious timing."
              )
              .catch(() => ""),
            cycles: z
              .string()
              .describe(
                "Describe the broader periods of financial growth, stability, or potential challenge that may recur in your life, based on your inherent Wuku and Weton influences."
              )
              .catch(() => ""),
            auspicious: z
              .string()
              .describe(
                "Highlight general types of times or phases that are traditionally considered more favorable for specific financial endeavors (e.g., starting new businesses, making significant investments, major purchases, signing contracts). Explain the energetic reason behind these recommendations."
              )
              .catch(() => ""),
            caution: z
              .string()
              .describe(
                "Identify types of times or phases that may require greater caution or conservative financial strategies (e.g., avoiding large risks, reviewing budgets, delaying major expenditures)."
              )
              .catch(() => ""),
            dina_apik: z
              .string()
              .describe(
                "Offer actionable advice on how to tune into and leverage these cyclical insights, emphasizing the wisdom of choosing dina apik for important financial undertakings, without guaranteeing outcomes."
              )
              .catch(() => ""),
            disclaimer: z
              .string()
              .describe(
                "Suggest types of environments or pursuits that would naturally support your journey towards your ideal life.Reinforce that these are energetic tendencies and not absolute predictions. Personal effort, due diligence, and market conditions remain crucial."
              )
              .catch(() => ""),
          }),
          purpose: z.object({
            introduction: z
              .string()
              .describe(
                "Explain how true abundance, from a Javanese perspective, often flows when one's material pursuits are aligned with their inherent gifts and contributions to the world."
              )
              .catch(() => ""),
            talents: z
              .string()
              .describe(
                "Identify your key innate talents, skills, and areas of intelligence (derived from your Weton and Laku) that are most conducive to creating wealth through meaningful work."
              )
              .catch(() => ""),
            values: z
              .string()
              .describe(
                "Discuss how your core values (from your Weton and Rakam) should guide your financial endeavors. What kind of earning methods would resonate most deeply with your integrity and sense of purpose?"
              )
              .catch(() => ""),
            contribution: z
              .string()
              .describe(
                "Explain how contributing your unique gifts to society or solving problems for others can naturally unlock financial opportunities and spiritual fulfillment."
              )
              .catch(() => ""),
            nurturing: z
              .string()
              .describe(
                'Offer advice on how to cultivate a personal "ecosystem" where your work, values, and financial aspirations are harmoniously intertwined, leading to sustainable prosperity.'
              )
              .catch(() => ""),
            sumbangsih: z
              .string()
              .describe(
                "Connect this section to the Javanese concept of sumbangsih, emphasizing that genuine contribution and service can be a powerful engine for both material and spiritual abundance."
              )
              .catch(() => ""),
          }),
        }),
        messages: [{ role: "user", content: proFinancialPrompt(profile) }],
      });
      const resObj = response.object;

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.financial,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newCareerReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.cycles,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newFinancialCyclesReading.id);

      await supabase
        .from("readings")
        .update({
          status: "completed",
          reading: resObj.purpose,
          input_token: response.usage.promptTokens,
          output_token: response.usage.completionTokens,
          total_token: response.usage.totalTokens,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newWealthPurposeReading.id);
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
          .eq("id", newCareerReading.id);
      }
    }
  } while (attempt < maxAttempts);
}

export async function generateLoveCompatibilityReading(
  profile1,
  profile2,
  wetonJodoh
) {
  const { data: newCompatibilityReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "compatibility",
      title: `${profile1.full_name.split(" ")[0]} and ${
        profile2.full_name.split(" ")[0]
      }`,
      subtitle:
        "Uncover the sacred blueprint of your relationship, revealing your destined path to harmony, passion, and true love through the timeless wisdom of the Javanese soul.",
      username: profile1.username,
      status: "loading",
      slug: `${profile1.username}-${profile2.username}-compatibility`,
      user_id: profile1.id,
      user_target_id: profile2.id,
    })
    .select()
    .maybeSingle();

  console.log("error", error);

  if (error) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newCompatibilityReading);

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
              thinkingBudget: 2000,
            },
          },
        },
        schema: z.object({
          header: z
            .string()
            .describe(
              "One sentence summarizing the heart of their romantic connection. Do not mention any name."
            )
            .catch(() => ""),
          insight: z
            .string()
            .describe(
              "A 2-3 sentences paragraph summarizing the heart of their romantic connection, its greatest gift, and its central lesson."
            )
            .catch(() => ""),
          analysis: z.object({
            foundational: z
              .string()
              .describe(
                "Analyze the combined using the 8-cycle system (e.g, Ratu, Jodoh, Pegat, etc.). Explain what this cosmic blueprint means for their destiny as a couple."
              )
              .catch(() => ""),
            dynamics: z
              .string()
              .describe(
                "Describe their elemental interaction from Laku in the context of passion, emotion, and daily interaction."
              )
              .catch(() => ""),
            home: z
              .string()
              .describe(
                "Use the Pancasuda (5-cycle system) analysis (e.g, Sri, Dana, Lara, Pati, Lungguh) to explore their joint potential for creating a stable, secure, and prosperous home."
              )
              .catch(() => ""),
            passion: z
              .string()
              .describe(
                'Based on their Weton characteristics, describe their natural "love languages." How do they express and receive affection, passion, and intimacy?'
              )
              .catch(() => ""),
            challenges: z
              .string()
              .describe(
                "Identify their primary conflict style and provide a clear map for resolving disagreements and strengthening their emotional bond."
              )
              .catch(() => ""),
            advice: z
              .string()
              .describe(
                "Conclude with empowering advice on how to consciously nurture their love, honor each other's spirits, and transform challenges into deeper intimacy."
              )
              .catch(() => ""),
          }),
          score: z
            .number()
            .describe("Overall Compatibility Score: A score of 0 to 100")
            .catch(() => ""),
        }),
        messages: [
          {
            role: "user",
            content: proLoveCompatibilityPrompt(profile1, profile2, wetonJodoh),
          },
        ],
      });
      const resObj = response.object;

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
        .eq("id", newCompatibilityReading.id);
    } catch (error) {
      console.log(error);
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
          .eq("id", newCompatibilityReading.id);
      }
    }
  } while (attempt < maxAttempts);
}

export async function generateCoupleCompatibilityReading(
  profile1,
  profile2,
  wetonJodoh
) {
  const { data: newCompatibilityReading, error } = await supabase
    .from("readings")
    .insert({
      reading_type: "pro",
      reading_category: "compatibility",
      title: `${profile1.full_name.split(" ")[0]} and ${
        profile2.full_name.split(" ")[0]
      }'s Compatibility`,
      subtitle:
        "Uncover the sacred blueprint of your relationship, revealing your destined path to harmony, passion, and true love through the timeless wisdom of the Javanese soul.",
      username: profile1.username,
      status: "loading",
      slug: `${profile1.username}-${profile2.username}-couple`,
      user_id: profile1.id,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting new reading:", error);
    throw error;
  }

  console.log("new reading generated on supabase", newCompatibilityReading);

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
              thinkingBudget: 2000,
            },
          },
        },
        schema: z.object({
          header: z
            .string()
            .describe(
              "1 sentence summarizing the heart of their romantic connection, its greatest gift, and its central lesson."
            )
            .catch(() => ""),
          score: z
            .number()
            .describe("Overall Compatibility Score: A score of 0 to 100")
            .catch(() => ""),
          insight: z
            .string()
            .describe(
              "A 2-3 sentences paragraph summarizing the heart of their romantic connection, its greatest gift, and its central lesson."
            )
            .catch(() => ""),
          summary: z.object({
            overall_compatibility: z
              .string()
              .describe(
                `Provide a concise summary of the couple's general compatibility (e.g., "A harmonious pairing with strong foundations," "A dynamic relationship that thrives on growth," "A challenging but transformative union requiring conscious effort").`
              )
              .catch(() => ""),
            strengths: z
              .string()
              .describe(
                "Identify the top 2-3 most significant areas of natural alignment and positive flow between the partners."
              )
              .catch(() => ""),
            challenges: z
              .string()
              .describe(
                "Identify the top 1-2 most significant areas that may require conscious attention, communication, and mutual effort."
              )
              .catch(() => ""),
            essence: z
              .string()
              .describe(
                'A metaphorical description of their combined energy (e.g., "Like two rivers flowing into a mighty current," "Like a complementary blend of fire and water," "Like two strong trees growing towards the sun").'
              )
              .catch(() => ""),
          }),
          deep_dive: z.object({
            journey: z.object({
              result: z
                .string()
                .describe(`[State the calculated result, e.g., "Padu"]`)
                .catch(() => ""),
              interpretation: z
                .string()
                .describe(
                  `Provide a detailed explanation of what this specific result signifies for the couple's relationship (e.g., for "Padu," discuss frequent arguments but also potential for growth through conflict, and how to navigate it).`
                )
                .catch(() => ""),
            }),
            fortune: z.object({
              result: z
                .string()
                .describe(`[State the calculated result, e.g., "Lungguh"]`)
                .catch(() => ""),
              interpretation: z
                .string()
                .describe(
                  `Detail what this result means for their shared financial path and overall prosperity (e.g., for "Lungguh," that implies possessing a position of honor or authority. discuss material comfort and sufficiency).`
                )
                .catch(() => ""),
            }),
            character: z.object({
              result: z
                .string()
                .describe(`[State the calculated result, e.g., "Sumur Sinaba"]`)
                .catch(() => ""),
              interpretation: z
                .string()
                .describe(
                  `Explain the implications for their emotional connection, wisdom, and how they mutually support each other's inner lives (e.g., for "Sumur Sinaba," indicate a relationship where others seek their advice, signifying wisdom).`
                )
                .catch(() => ""),
            }),
            destiny: z.object({
              result: z
                .string()
                .describe(`[State the calculated result, e.g., "Jodoh"]`)
                .catch(() => ""),
              interpretation: z
                .string()
                .describe(
                  `Provide a comprehensive explanation of what this result suggests about their fated connection, major life events they might face together, and how they are destined to interact (e.g., for "Jodoh," indicate a deeply harmonious and fated connection).`
                )
                .catch(() => ""),
            }),
          }),
          blend: z.object({
            neptu: z.object({
              interpretation: z
                .string()
                .describe(
                  `Explain the general meaning of this neptu based on ${wetonJodoh.jodoh9.result} in terms of the couple's overall energetic signature, shared destiny, and collective temperament.`
                )
                .catch(() => ""),
            }),
            dina: z.object({
              interpretation: z
                .string()
                .describe(
                  `Explain the general meaning of this dina combination based on ${wetonJodoh.jodohDay.result}`
                )
                .catch(() => ""),
              weton_essence: z
                .string()
                .describe(
                  `Briefly describe the core energetic characteristics of each partner's individual Weton (e.g., "Kamis Legi brings a thoughtful, influential energy..." and "Sabtu Pon brings a determined, somewhat reserved energy...").`
                )
                .catch(() => ""),
              dynamics: z
                .string()
                .describe(
                  `Analyze how these two specific Weton energies interact. Are they complementary (saling melengkapi), do they create a powerful synergy, or are there natural areas of friction? Provide specific examples of how these might play out in their daily lives.`
                )
                .catch(() => ""),
            }),
          }),
          dynamics: z.object({
            harmony: z
              .string()
              .describe(
                `Identify 2-3 key aspects where your combined Weton energies create effortless understanding, support, or shared joy (e.g., shared values, complementary work ethics, similar emotional needs, balanced elemental forces leading to stability or passion).`
              )
              .catch(() => ""),
            mutual_growth: z
              .string()
              .describe(
                `What unique qualities does each partner's Weton bring to the relationship that enriches the other, fosters mutual growth, or strengthens the partnership as a whole?`
              )
              .catch(() => ""),
            synergy: z
              .string()
              .describe(
                `Where do your combined Weton energies create a powerful synergy that allows you to achieve more together than individually?`
              )
              .catch(() => ""),
            keselarasan: z
              .string()
              .describe(
                `Connect these strengths to the Javanese ideal of keselarasan, explaining how your Weton blend naturally promotes balance and understanding.`
              )
              .catch(() => ""),
          }),
          challenges: z.object({
            friction: z
              .string()
              .describe(
                `Identify 2-3 key areas where your Weton components might naturally clash, creating misunderstandings, disagreements, or differing needs (e.g., conflicting communication styles, contrasting approaches to finances, differing desires for independence vs. closeness, emotional reactions).`
              )
              .catch(() => ""),
            root_cause: z
              .string()
              .describe(
                `Briefly explain why these clashes might occur, linking them directly to specific Weton characteristics or traditional interpretations (e.g., "Partner A's 'Lakune Geni' might clash with Partner B's 'Lakune Banyu' in emotionally charged situations, requiring mindful emotional regulation").`
              )
              .catch(() => ""),
            strategies: z
              .string()
              .describe(
                `Offer concrete, actionable advice rooted in Javanese wisdom for navigating these challenges (e.g., fostering patience (sabar), practicing sincerity (ikhlas), engaging in open dialogue (musyawarah), cultivating empathy (tepa slira), or understanding each other's watak (character) and sifat (traits)).`
              )
              .catch(() => ""),
            transformative: z
              .string()
              .describe(
                `Emphasize that challenges are opportunities for deeper understanding and growth, leading to a stronger, more resilient bond.`
              )
              .catch(() => ""),
          }),
          wisdom: z.object({
            relationship_journey: z
              .string()
              .describe(
                `Briefly summarize the core nature of your union, integrating the various insights from the reading.`
              )
              .catch(() => ""),
            effort_devotion: z
              .string()
              .describe(
                `Emphasize that while Weton provides a map of inherent tendencies, the success and happiness of a relationship ultimately depend on conscious effort (usaha), mutual respect, open communication, and devotion (bhakti) to one another.`
              )
              .catch(() => ""),
            final_statement: z
              .string()
              .describe(
                `A final, uplifting statement encouraging the couple to embrace their unique blend of energies and consciously build a fulfilling partnership.`
              )
              .catch(() => ""),
          }),
        }),
        messages: [
          {
            role: "user",
            content: proCoupleCompatibilityPrompt(
              profile1,
              profile2,
              wetonJodoh
            ),
          },
        ],
      });
      const resObj = response.object;

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
        .eq("id", newCompatibilityReading.id);
    } catch (error) {
      console.log(error);
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
          .eq("id", newCompatibilityReading.id);
      }
    }
  } while (attempt < maxAttempts);
}

export async function getServerSideProps(context) {
  const supabase = createClient(context);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      user: data.user,
      supabase: supabase,
    },
  };
}
