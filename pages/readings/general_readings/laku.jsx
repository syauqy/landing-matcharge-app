import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { fetchProfileData, handleGenerateReading } from "@/utils/fetch";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { Capacitor } from "@capacitor/core";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ReadingLoadingSkeleton } from "@/components/readings/reading-loading-skeleton";
import { ReadingDescription } from "@/components/readings/reading-description";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";
import { ReadingSubscriptionButton } from "@/components/subscriptions/reading-subscription-button";
import { AnimatedLoadingText } from "@/components/readings/AnimatedLoadingText";
import { useReading } from "@/utils/useReading";

export default function LakuPage() {
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
      icon: "🎭",
      title: "Core Meaning & Symbolism",
      description:
        "Explain the metaphorical meaning of this specific Laku and its core characteristics.",
    },
    {
      icon: "💪",
      title: "Inherent Strengths",
      description: `Detail the natural positive qualities that stem from this Laku.`,
    },
    {
      icon: "🚧",
      title: "Potential Challenges",
      description:
        "The potential pitfalls or areas where your awareness and conscious effort are needed.",
    },
    {
      icon: "📣",
      title: "Influence on Life Approach",
      description:
        "How does your Laku shape your general approach to daily life, decision-making, and facing adversity?",
    },
    {
      icon: "🧘🏻‍♀️",
      title: "A Ritual for Your Element",
      description:
        "Actionable guidance on how to best embody the positive aspects of your Laku and mitigate its challenges.",
    },
  ];

  const loadingMessages = [
    {
      text: "Unveiling the core meaning and symbolism of your Laku...",
      emoji: "🎭",
    },
    {
      text: "Exploring the metaphorical significance of your path...",
      emoji: "🔮",
    },
    {
      text: "Interpreting your inherent strengths and positive qualities...",
      emoji: "💪",
    },
    {
      text: "Detailing the natural gifts that shape your journey...",
      emoji: "🎁",
    },
    {
      text: "Highlighting potential challenges and areas for growth...",
      emoji: "🚧",
    },
    {
      text: "Examining pitfalls and where conscious effort is needed...",
      emoji: "⚠️",
    },
    {
      text: "Understanding how your Laku influences your life approach...",
      emoji: "📣",
    },
    {
      text: "Guiding you with a ritual to embody your element...",
      emoji: "🧘🏻‍♀️",
    },
    {
      text: "Offering actionable advice for personal well-being and success...",
      emoji: "🌱",
    },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "general_readings", "laku", "pro");

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
  //         slug: "laku",
  //         reading_category: "general_readings",
  //         reading_type: "pro",
  //         api_url: "readings/general/general-pro-1",
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
          title="Laku"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"🔮 Personal"}
            title={"Laku"}
            topics={topics}
            description={`This reading delves into your inherent 'Laku' or 'Path', revealing a fundamental aspect of your personality, destiny, and how you naturally navigate life's challenges and opportunities.`}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Laku"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {(error || readingError) && (
        <ErrorLayout error={error || readingError} router={router} />
      )}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {isLoadingReading ? (
          <>
            <AnimatedLoadingText messages={loadingMessages} />
            <ReadingLoadingSkeleton />
          </>
        ) : reading?.status === "completed" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-left">Laku</h2>
              <p className="text-sm text-gray-700 mb-2">
                Discover the archetype and behavioral pattern that guides your
                life&apos;s journey.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.core_meaning}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="🎭 Core Meaning & Symbolism"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.strengths}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="💪 Inherent Strengths"
            />
            <ContentSection
              reading={reading?.reading?.challenges}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🚧 Potential Challenges"
            />
            <ContentSection
              reading={reading?.reading?.influence}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="📣 Influence on Life Approach"
            />
            <ContentSection
              reading={reading?.reading?.ritual}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="🧘🏻‍♀️ A Ritual for Your Element"
            />
            {reading?.id && <FeedbackSession user={user} reading={reading} />}
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
              title={"Laku"}
              topics={topics}
              description={`This reading delves into your inherent 'Laku' or 'Path', revealing a fundamental aspect of your personality, destiny, and how you naturally navigate life's challenges and opportunities.`}
            />
          )
        )}
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
                apiUrl: "readings/general/general-pro-1",
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
