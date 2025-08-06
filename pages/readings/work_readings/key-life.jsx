import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { fetchProfileData, handleGenerateReading } from "@/utils/fetch";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
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
      icon: "🪂",
      title: "Overarching Life Trajectory",
      description: `The general 'flavor' or dominant journey theme of your life path.`,
    },
    {
      icon: "🎸",
      title: "Rhytm of Your Story",
      description: `The significant events or challenges you may recurrently encounter.`,
    },
    {
      icon: "🐛",
      title: "Your Character Development",
      description: `The potential lessons or transformations that often accompany these key life themes.`,
    },
    {
      icon: "💪",
      title: "Destiny and Effort",
      description: `The connection with Javanese philosophical understanding of takdir (what is given) and usaha (what is cultivated through effort).`,
    },
    {
      icon: "📖",
      title: "Turning the Page",
      description: `General guidance on how to approach major life transitions with awareness and wisdom.`,
    },
  ];

  // adjust the data according to topics const above, min 9 objects. Change the emoji based on the text

  const loadingMessages = [
    {
      text: "Mapping your overarching life trajectory...",
      emoji: "🪂",
    },
    {
      text: "Uncovering the rhythm of your story and its cycles...",
      emoji: "🎸",
    },
    {
      text: "Exploring your character development through key lessons...",
      emoji: "🐛",
    },
    {
      text: "Understanding destiny and the role of effort in your journey...",
      emoji: "💪",
    },
    {
      text: "Preparing to turn the page on major life transitions...",
      emoji: "📖",
    },
    {
      text: "Identifying recurring themes that shape your path...",
      emoji: "🔄",
    },
    {
      text: "Recognizing pivotal moments in your personal growth...",
      emoji: "🌱",
    },
    {
      text: "Connecting philosophical insights to your life story...",
      emoji: "🧠",
    },
    {
      text: "Visualizing the journey toward wisdom and awareness...",
      emoji: "🌅",
    },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "work_readings", "key-life", "pro");

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
  //         slug: "key-life",
  //         reading_category: "work_readings",
  //         reading_type: "pro",
  //         api_url: "readings/work/work-pro",
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
          title="Key Life Themes"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"💼 Work, Career, and Purpose"}
            title={"Key Life Themes"}
            topics={topics}
            description={`This reading provides insight into the overarching themes and types of experiences that may manifest as significant turning points or recurring patterns throughout your life, informed by your Weton, Wuku, and Laku cycles.`}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Key Life Themes"
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
              <h2 className="text-xl font-semibold text-left">
                Key Life Themes
              </h2>
              <p className="text-sm text-gray-700 mb-2">
                Identify potential pivotal moments and themes that may shape
                your journey.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.trajectory}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="🪂 Overarching Life Trajectory"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.cycles}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="🎸 Rhytm of Your Story"
            />
            <ContentSection
              reading={reading?.reading?.lessons}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🐛 Your Character Development"
            />
            <ContentSection
              reading={reading?.reading?.destiny}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="💪 Destiny and Effort"
            />
            <ContentSection
              reading={reading?.reading?.transitions}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="📖 Turning the Page"
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
              reading_category={"💼 Work, Career, and Purpose"}
              title={"Key Life Themes"}
              topics={topics}
              description={`This reading provides insight into the overarching themes and types of experiences that may manifest as significant turning points or recurring patterns throughout your life, informed by your Weton, Wuku, and Laku cycles.`}
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
                apiUrl: "readings/work/work-pro",
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
