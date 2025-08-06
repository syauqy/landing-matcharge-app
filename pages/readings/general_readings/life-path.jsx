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

export default function LifePathPage() {
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
  const [isSectionSixOpen, setIsSectionSixOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const [isGenerating, setIsGenerating] = useState(false);

  const topics = [
    {
      icon: "🍀",
      title: "Overall Trajectory & Fortune",
      description: "The general flavor of your life path.",
    },
    {
      icon: "🗝️",
      title: "Key Life Themes",
      description: `themes or lessons that may appear throughout your life.`,
    },
    {
      icon: "🍃",
      title: "Areas of Natural Flow",
      description:
        "Where might you find life tends to unfold more easily or where opportunities naturally arise?",
    },
    {
      icon: "🚧",
      title: "Areas of Potential Challenge",
      description:
        "Where might you encounter recurring lessons or challenges that serve as catalysts for personal development?",
    },
    {
      icon: "🎡",
      title: "Connection to Wheel of Life",
      description:
        "Frame your life path within the Javanese concept of Cakra Manggilingan (the turning wheel of life).",
    },
    {
      icon: "🔭",
      title: "Empowering Outlook",
      description: "The divination message for you.",
    },
  ];

  const loadingMessages = [
    {
      text: "Mapping your overall life trajectory and fortune...",
      emoji: "🍀",
    },
    {
      text: "Identifying key themes and lessons in your journey...",
      emoji: "🗝️",
    },
    {
      text: "Finding areas where life flows naturally for you...",
      emoji: "🍃",
    },
    {
      text: "Spotting recurring challenges and growth opportunities...",
      emoji: "🚧",
    },
    {
      text: "Connecting your path to the Wheel of Life (Cakra Manggilingan)...",
      emoji: "🎡",
    },
    {
      text: "Empowering your outlook with divination insights...",
      emoji: "🔭",
    },
    {
      text: "Synthesizing your Weton, Wuku, and Laku for deeper meaning...",
      emoji: "🔮",
    },
    {
      text: "Reflecting on how your journey shapes relationships...",
      emoji: "🤝",
    },
    {
      text: "Preparing your personalized life path reading...",
      emoji: "📜",
    },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "general_readings", "life-path", "pro");

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
  //         slug: "life-path",
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
          title="Life Path"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"🔮 Personal"}
            title={"Life Path"}
            topics={topics}
            description={`This reading provides a broad overview of your likely life trajectory, predispositions, and the overarching themes that may define your journey, as indicated by the synthesis of your Weton, Wuku, and Laku.`}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Life Path"
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
              <h2 className="text-xl font-semibold text-left">Life Path</h2>
              <p className="text-sm text-gray-700 mb-2">
                Get insights into the themes and directions of your life&apos;s
                journey.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.fortune}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="🍀 Overall Trajectory & Fortune"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.theme}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="🗝️ Key Life Themes"
            />
            <ContentSection
              reading={reading?.reading?.flow}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🍃 Areas of Natural Flow"
            />
            <ContentSection
              reading={reading?.reading?.challenge}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="🚧 Areas of Potential Challenge"
            />
            <ContentSection
              reading={reading?.reading?.wheel_of_life}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="🎡 Connection to Wheel of Life"
            />
            <ContentSection
              reading={reading?.reading?.outlook}
              setIsSectionOpen={setIsSectionSixOpen}
              isSectionOpen={isSectionSixOpen}
              title="🔭 Empowering Outlook"
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
              title={"Life Path"}
              topics={topics}
              description={`This reading provides a broad overview of your likely life trajectory, predispositions, and the overarching themes that may define your journey, as indicated by the synthesis of your Weton, Wuku, and Laku.`}
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
