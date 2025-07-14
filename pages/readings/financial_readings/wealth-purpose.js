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

export default function WealthPurposePage() {
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
      icon: "🏆",
      title: "Talents & Abilities for Prosperity",
      description:
        "Your key talents, skills, and areas of intelligence that are most conducive to creating wealth through meaningful work.",
    },
    {
      icon: "💎",
      title: "Ethical & Values-Aligned Earning",
      description: `How your core values (from your Weton and Rakam) guide your financial endeavors.`,
    },
    {
      icon: "💪",
      title: "Contribution as a Source of Abundance",
      description:
        "How contributing your unique gifts to solve problems for others can naturally unlock financial opportunities.",
    },
    {
      icon: "🪴",
      title: "Nuruturing Your Financial Ecosystem",
      description: `Advice on how to cultivate a personal "ecosystem" where your work, values, and financial aspirations are harmoniously intertwined.`,
    },
  ];

  const disclaimer =
    "This guidance offers insights into your inherent predispositions, but your conscious choices and actions ultimately shape your financial reality.";

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
  //         .eq("reading_category", "financial_readings")
  //         .eq("slug", "wealth-purpose")
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
          slug: "wealth-purpose",
          reading_category: "financial_readings",
          reading_type: "pro",
          api_url: "readings/financial/financial-pro",
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
        title="Wealth Through Purpose"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-left">
                Wealth Through Purpose
              </h2>
              <p className="text-sm text-gray-700 mb-2">
                Explores how your Weton impacting financial prosperity and
                personal fulfillment.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.talents}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="🏆 Talents & Abilities for Prosperity"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.values}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="💎 Ethical & Values-Aligned Earning"
            />
            <ContentSection
              reading={reading?.reading?.contribution}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="💪 Contribution as a Source of Abundance"
            />
            <ContentSection
              reading={reading?.reading?.nurturing}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="🪴 Nuruturing Your Financial Ecosystem"
            />
          </div>
        ) : reading?.status === "pending" ? (
          <ReadingLoading />
        ) : (
          !reading && (
            <ReadingDescription
              reading_category={"💰 Financial Fortune"}
              title={"Wealth Through Purpose"}
              topics={topics}
              description={
                "This reading explores how your unique talents, core values, and life purpose can be channeled into pathways that lead to both financial prosperity and profound personal fulfillment."
              }
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
                  slug: "wealth-purpose",
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
