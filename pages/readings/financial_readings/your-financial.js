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
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { Capacitor } from "@capacitor/core";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ReadingDescription } from "@/components/readings/reading-description";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";
import { DisclaimerSection } from "@/components/readings/disclaimer-section";

export default function FinancialPage() {
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
      icon: "🤔",
      title: "Financial Mindset",
      description: "Your natural approach to earning, saving, and spending.",
    },
    {
      icon: "📈",
      title: "General Wealth Tendencies",
      description: `Overall predisposition towards attracting or managing financial resources.`,
    },
    {
      icon: "🎯",
      title: "Opportunities for Attracting Wealth",
      description:
        "The key elements or practices that are essential for you to achieve and maintain peace and tranquility in your daily existence.",
    },
    {
      icon: "🚧",
      title: "Pontential Financial Pitfalls",
      description:
        "Inherent tendencies that might lead to financial challenges or require careful management.",
    },
    {
      icon: "🧘",
      title: "Hidden Strength & Karmic Lesson",
      description: `Connect your financial insights to the Javanese concept of 'jembar rejeki' or abundant sustenance.`,
    },
  ];

  const disclaimer =
    "This guidance offers insights into your inherent predispositions. Your personal effort, diligent research, and understanding of market conditions remain crucial.";

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
  //       const { data: existingReading, error: fetchError } = await supabase
  //         .from("readings")
  //         .select("reading, status")
  //         .eq("reading_type", "pro")
  //         .eq("user_id", user.id)
  //         .eq("reading_category", "financial_readings")
  //         .eq("slug", "your-financial")
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
  //             `${config.api.url}/readings/financial/financial-pro`,
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
          slug: "your-financial",
          reading_category: "financial_readings",
          reading_type: "pro",
          api_url: "readings/financial/financial-pro",
        });
      }
    }
  }, [profileData]);

  const introduction = profileData?.weton
    ? `Your ${profileData?.weton?.weton_en} Weton, with a Neptu of ${profileData?.weton?.total_neptu}, combined with your Rakam ${profileData?.weton?.rakam?.name}, provides deep insight into your fundamental character. This combination reveals your innate relationship with money, your general tendencies towards abundance, and how you naturally approach finacial management.`
    : "";

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
        title="Your Financial"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-left">
                Your Financial
              </h2>
              {profileData?.subscription == "free" && (
                <p className="text-sm text-gray-700 mb-2">{introduction}</p>
              )}
            </div>
            <section className="pt-4">
              <h2 className="text-sm text-batik-text font-semibold">
                Your Financial Archetype
              </h2>
              <div className="flex flex-col">
                <p className="text-batik-black text-lg font-semibold">
                  {reading?.reading?.archetype}
                </p>
              </div>
            </section>
            <ContentSection
              reading={reading?.reading?.mindset}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="🤔 Financial Mindset"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.tendencies}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="📈 General Wealth Tendencies"
            />
            <ContentSection
              reading={reading?.reading?.opportunities}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🎯 Opportunities for Attracting Wealth"
            />
            <ContentSection
              reading={reading?.reading?.pitfalls}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="🚧 Pontential Financial Pitfalls"
            />
            <ContentSection
              reading={reading?.reading?.karmic}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="🧘 Hidden Strength & Karmic Lesson"
            />
          </div>
        ) : reading?.status === "pending" ? (
          <ReadingLoading />
        ) : (
          !reading && (
            <ReadingDescription
              reading_category={"💰 Financial Fortune"}
              title={"Your Financial"}
              topics={topics}
              description={introduction}
            />
          )
        )}
        {reading?.id && (
          <div>
            <FeedbackSession user={user} reading={reading} />
            <DisclaimerSection
              title={"These are energetic tendencies, not absolute predictions"}
              description={disclaimer}
            />
          </div>
        )}
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
                  slug: "your-financial",
                  reading_category: "financial_readings",
                  reading_type: "pro",
                  api_url: "readings/financial/financial-pro",
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
