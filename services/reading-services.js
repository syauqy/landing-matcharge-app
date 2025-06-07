import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
// import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import {
  dailyReadingPrompt,
  monthlyReadingPrompt,
  primaryTraitsPrompt,
  basicLovePrompt,
  proLovePrompt,
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
          .eq("id", newReading.id);
      }
    }
  } while (attempt < maxAttempts);
}
