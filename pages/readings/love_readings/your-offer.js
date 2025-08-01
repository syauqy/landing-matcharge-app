import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import {
  fetchProfileData,
  handleGenerateReading,
  fetchReading,
} from "@/utils/fetch";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { Capacitor } from "@capacitor/core";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ReadingDescription } from "@/components/readings/reading-description";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";

export default function YourOfferPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [isSectionOneOpen, setIsSectionOneOpen] = useState(true);
  const [isSectionTwoOpen, setIsSectionTwoOpen] = useState(false);
  const [isSectionThreeOpen, setIsSectionThreeOpen] = useState(false);
  const [isSectionFourOpen, setIsSectionFourOpen] = useState(false);
  const [isSectionFiveOpen, setIsSectionFiveOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const topics = [
    {
      icon: "👩‍❤️‍👨",
      title: "Your Relationship Superpowers",
      description:
        "Your most significant innate gifts or strengths that you bring to a partnership",
    },
    {
      icon: "☁️",
      title: "The Atmosphere You Create",
      description: `How these specific Weton-derived qualities positively influence your partner's life or the overall relationship dynamic.`,
    },
    {
      icon: "🥰",
      title: "How You Show You Care",
      description:
        "How does your Weton shape your capacity for nurturing, supporting, and caring for a partner.",
    },
    {
      icon: "😮‍💨",
      title: "When Things Get Tough",
      description:
        "Unique approach or quality do you bring when facing challenges or problems within the relationship.",
    },
    {
      icon: "✅",
      title: "Responsibility in Love",
      description:
        "How your innate traits empower you to uphold your responsibilities and commitments.",
    },
  ];

  const disclaim =
    "While Weton provides valuable insights into inherent tendencies and energetic dynamics, it does not dictate absolute destinies or outcomes in relationships. These insights serve as a guide for self-understanding and for navigating relationships with greater awareness and wisdom, not as a rigid prediction of success or failure. Human agency, conscious effort, open communication, and genuine love are paramount. Every relationship is a unique journey of two individuals, and challenges can always be overcome with dedication.";

  const disclaimer =
    "These insights serve as a guide for self-understanding and for navigating relationships with greater awareness and wisdom, not as a rigid prediction of success or failure.";
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Or your app's login page
      return;
    }

    if (!router.isReady || !user) {
      setLoading(true);
      return;
    }

    fetchProfileData({ user, setLoading, setError, setProfileData });
  }, []);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    setShowTitleInNavbar(scrollPosition > 100);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // const handleGenerateReading = async () => {
  //   setError(null);
  //   setLoading(true);

  //   if (!profileData || !user) {
  //     setError("Profile data or user not available.");
  //     setLoading(false);
  //     return;
  //   } else {
  //     try {
  //       // Check if primary-traits reading exists
  //       const { data: existingReading, error: fetchError } = await supabase
  //         .from("readings")
  //         .select("reading, status")
  //         .eq("reading_type", "pro")
  //         .eq("user_id", user.id)
  //         .eq("reading_category", "love_readings")
  //         .eq("slug", "your-offer")
  //         .maybeSingle();

  //       console.log("Existing Reading:", existingReading, user.id);

  //       console.log(existingReading);

  //       if (fetchError && fetchError.code !== "PGRST116") {
  //         throw fetchError;
  //       }

  //       // If reading exists, show it
  //       if (existingReading) {
  //         setReading(existingReading);
  //         setLoading(false);
  //         return;
  //       } else if (!existingReading && !fetchError) {
  //         console.log("No existing reading found, generating new one...");
  //         setLoading(false);
  //         try {
  //           // Generate new reading if none exists
  //           const response = await fetch(
  //             `${config.api.url}/readings/love/love-pro`,
  //             {
  //               method: "POST",
  //               headers: {
  //                 "Content-Type": "application/json",
  //               },
  //               body: JSON.stringify({ profile: profileData }),
  //               credentials: "include",
  //             }
  //           );

  //           const readingData = await response.json();
  //           setReading(readingData);
  //         } catch (err) {
  //           console.error(
  //             "Error in fetch or processing response for daily reading:",
  //             err
  //           );
  //           setError(err.message || "Failed to generate daily reading.");
  //         } finally {
  //           setLoading(false);
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error:", err);
  //       setError(err.message || "Failed to generate reading");
  //       setLoading(false);
  //     }
  //   }
  // };

  useEffect(() => {
    if (profileData && user) {
      if (isNative) {
        fetchReading({
          profileData,
          user,
          setReading,
          setLoading,
          setError,
          slug: "your-offer",
          reading_category: "love_readings",
          reading_type: "pro",
          api_url: "readings/love/love-pro",
        });
      }
    }
  }, [profileData]);

  // console.log("Profile Data:", profileData);

  if (authLoading || (loading && !error)) {
    return <PageLoadingLayout />;
  }

  if (!profileData) {
    return (
      <NoProfileLayout
        router={router}
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="What You Offer"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />
      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-left">
                What You Offer
              </h2>
              <p className="text-sm text-gray-700 mb-2">
                Identify the unique strengths and gifts you bring to a loving
                relationship.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.key_positive}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="👩‍❤️‍👨 Your Relationship Superpowers"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.impact}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="☁️ The Atmosphere You Create"
            />
            <ContentSection
              reading={reading?.reading?.tendency}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🥰 How You Show You Care"
            />
            <ContentSection
              reading={reading?.reading?.approach}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="😮‍💨 When Things Get Tough"
            />
            <ContentSection
              reading={reading?.reading?.responsibility}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="✅ Responsibility in Love"
            />
            <section className="p-4 border-slate-100 border rounded-2xl bg-base-100 shadow-md mt-10">
              <p className="text-sm text-gray-700">{disclaimer}</p>
            </section>
          </div>
        ) : reading?.status === "loading" ? (
          <ReadingLoading />
        ) : (
          !reading && (
            <ReadingDescription
              reading_category={"💖 Love and Relationship"}
              title={"What You Can Offer"}
              topics={topics}
              description={`This reading highlights the unique strengths, qualities, and contributions you bring to any relationship, directly derived from your Weton, Rakam, dan Laku.`}
            />
          )
        )}

        {reading?.id && <FeedbackSession user={user} reading={reading} />}
      </main>
      {!reading && (
        <div className="fixed bottom-0 w-full p-2 pb-10 bg-base-100 border-batik-border shadow-[0px_-4px_12px_0px_rgba(0,_0,_0,_0.1)]">
          {profileData?.subscription == "pro" ? (
            <button
              className="btn bg-rose-400 font-semibold text-white rounded-xl w-full"
              onClick={() =>
                handleGenerateReading({
                  profileData,
                  user,
                  setReading,
                  setLoading,
                  setError,
                  slug: "your-offer",
                  reading_category: "love_readings",
                  reading_type: "pro",
                  api_url: "readings/love/love-pro",
                })
              }
            >
              Generate Reading
            </button>
          ) : (
            <button
              className="btn bg-amber-600 font-semibold text-white rounded-xl w-full"
              onClick={() => {}}
            >
              🔓 Unlock With Pro
            </button>
          )}
        </div>
      )}
    </div>
  );
}
