import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { fetchProfileData, handleGenerateReading } from "@/utils/fetch";
import { LoadingProfile } from "@/components/layouts/loading-profile";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { Capacitor } from "@capacitor/core";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ReadingDescription } from "@/components/readings/reading-description";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";
import { ReadingSubscriptionButton } from "@/components/subscriptions/reading-subscription-button";
import { AnimatedLoadingText } from "@/components/readings/AnimatedLoadingText";
import { useReading } from "@/utils/useReading";
import { ReadingLoadingSkeleton } from "@/components/readings/reading-loading-skeleton";

export default function ValuesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [isSectionOneOpen, setIsSectionOneOpen] = useState(true);
  const [isSectionTwoOpen, setIsSectionTwoOpen] = useState(false);
  const [isSectionThreeOpen, setIsSectionThreeOpen] = useState(false);
  const [isSectionFourOpen, setIsSectionFourOpen] = useState(false);
  const [isSectionFiveOpen, setIsSectionFiveOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const [isGenerating, setIsGenerating] = useState(false);

  const topics = [
    {
      icon: "💎",
      title: "Primary Values",
      description:
        "Your dominant core values that are most pronounced in your Weton.",
    },
    {
      icon: "🤞",
      title: "How Values Manifest",
      description: `How these values are likely to manifest in your daily behavior, relationships, and professional life.`,
    },
    {
      icon: "🔥",
      title: "Source of Motivation",
      description: "What truly drives your actions and aspirations?",
    },
    {
      icon: "🤬",
      title: "Potential Value Conflicts",
      description:
        "Inherent tensions between different values or how external pressures might challenge your core principles.",
    },
    {
      icon: "💭",
      title: "Philosophical Connection",
      description:
        "Connect your core values to broader Javanese philosophical concepts or ethical guidelines.",
    },
  ];

  const loadingMessages = [
    {
      text: "Identifying your dominant core values...",
      emoji: "💎",
    },
    {
      text: "Exploring how your values manifest in daily life...",
      emoji: "🤞",
    },
    {
      text: "Uncovering the source of your motivation...",
      emoji: "🔥",
    },
    {
      text: "Highlighting potential value conflicts...",
      emoji: "🤬",
    },
    {
      text: "Connecting your values to Javanese philosophy...",
      emoji: "💭",
    },
    {
      text: "Analyzing how your values influence relationships...",
      emoji: "🤝",
    },
    {
      text: "Examining the impact of values on your professional life...",
      emoji: "💼",
    },
    {
      text: "Understanding external pressures on your principles...",
      emoji: "🌪️",
    },
    {
      text: "Offering guidance to align with your core values...",
      emoji: "🧭",
    },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "general_readings", "values", "pro");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (!router.isReady || !user) {
      setLoadingProfile(true);
      return;
    }

    fetchProfileData({
      user,
      setLoading: setLoadingProfile,
      setError,
      setProfileData,
    });
  }, [user, authLoading, router.isReady]);

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

  // useEffect(() => {
  //   if (profileData && user) {
  //     if (isNative) {
  //       fetchReading({
  //         profileData,
  //         user,
  //         setReading,
  //         setLoading,
  //         setError,
  //         slug: "values",
  //         reading_category: "general_readings",
  //         reading_type: "pro",
  //         api_url: "readings/general/general-pro-2",
  //       });
  //     }
  //   }
  // }, [profileData]);

  // console.log("Profile Data:", profileData);

  if (authLoading || (loadingProfile && !error)) {
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

  if (profileData?.subscription !== "pro") {
    return (
      <div className="min-h-screen bg-base-100 text-base-content font-sans">
        <ReadingNavbar
          title="Values"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"🔮 Personal"}
            title={"Values"}
            topics={topics}
            description={`This reading uncovers the deep-seated values that intrinsically motivate you, influenced by your birth Weton, Rakam, and Pancasuda. These are the principles that guide your decisions and define your sense of purpose.`}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Values"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {(error || readingError) && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {isLoadingReading ? (
          <>
            <AnimatedLoadingText messages={loadingMessages} />
            <ReadingLoadingSkeleton />
          </>
        ) : reading?.status === "completed" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-left">Values</h2>
              <p className="text-sm text-gray-700 mb-2">
                Pinpoint the core principles that drive your decisions and
                motivations.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.primary_value}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="💎 Primary Value"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.manifest}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="🤞 How Values Manifest"
            />
            <ContentSection
              reading={reading?.reading?.motivation}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🔥 Source of Motivation"
            />
            <ContentSection
              reading={reading?.reading?.conflicts}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="🤬 Potential Value Conflicts"
            />
            <ContentSection
              reading={reading?.reading?.philosophy}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="💭 Philosophical Connection"
            />
          </div>
        ) : reading?.status === "loading" ? (
          <>
            <AnimatedLoadingText messages={loadingMessages} />
            <ReadingLoadingSkeleton />
          </>
        ) : (
          !reading && (
            <ReadingDescription
              reading_category={"🔮 Personal"}
              title={"Values"}
              topics={topics}
              description={`This reading uncovers the deep-seated values that intrinsically motivate you, influenced by your birth Weton, Rakam, and Pancasuda. These are the principles that guide your decisions and define your sense of purpose.`}
            />
          )
        )}
        {reading?.id && <FeedbackSession user={user} reading={reading} />}
      </main>
      {!isLoadingReading && !reading && (
        <div className="fixed bottom-0 w-full p-2 pb-10 bg-base-100 border-batik-border shadow-[0px_-4px_12px_0px_rgba(0,_0,_0,_0.1)]">
          <button
            className="btn bg-rose-400 font-semibold disabled:bg-slate-300 text-white rounded-xl w-full"
            disabled={isGenerating}
            onClick={() =>
              handleGenerateReading({
                profileData,
                user,
                apiUrl: "readings/general/general-pro-2",
                setError,
                setIsGenerating,
              })
            }
          >
            {isGenerating ? "Generating..." : "Generate Reading"}
          </button>
        </div>
      )}
    </div>
  );
}
