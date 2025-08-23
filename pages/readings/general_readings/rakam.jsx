import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { fetchProfileData, handleGenerateReading } from "@/utils/fetch";
// import { LoadingProfile } from "@/components/layouts/loading-profile";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { Capacitor } from "@capacitor/core";
import { ReadingDescription } from "@/components/readings/reading-description";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";
import { ReadingLoadingSkeleton } from "@/components/readings/reading-loading-skeleton";
import { ReadingSubscriptionButton } from "@/components/subscriptions/reading-subscription-button";
import { AnimatedLoadingText } from "@/components/readings/AnimatedLoadingText";
import { useReading } from "@/utils/useReading";

export default function RakamPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  // const [reading, setReading] = useState(null);
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
      icon: "📜",
      title: "The Story of Your Rakam",
      description:
        "Metaphorical meaning of this Rakam its influence on one's inherent spiritual nature.",
    },
    {
      icon: "🔶",
      title: "How This Theme Shapes You",
      description: `Detail the inherent strengths and areas for self-awareness.`,
    },
    {
      icon: "🌏",
      title: "How the Plot Affects Your World",
      description:
        "How this Rakam impacts your general fortune, social interactions, and public perception or reputation.",
    },
    {
      icon: "😇",
      title: "The Moral of Your Story",
      description:
        "Actionable guidance on how to embrace its strengths and navigate its complexities for a more harmonious life.",
    },
  ];

  const loadingMessages = [
    { text: "Unveiling the story of your Rakam...", emoji: "📜" },
    {
      text: "Interpreting the metaphorical meaning of your Rakam...",
      emoji: "📖",
    },
    { text: "Exploring how this theme shapes you...", emoji: "🔶" },
    { text: "Detailing your inherent strengths...", emoji: "💪" },
    { text: "Highlighting areas for self-awareness...", emoji: "🧠" },
    { text: "Examining how the plot affects your world...", emoji: "🌏" },
    { text: "Understanding your social interactions...", emoji: "🤝" },
    { text: "Revealing the moral of your story...", emoji: "😇" },
    { text: "Guiding you towards harmony in life...", emoji: "🕊️" },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "general_readings", "rakam", "pro");

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
  //         slug: "rakam",
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
          title="Rakam"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"🔮 Personal"}
            title={"Rakam"}
            topics={topics}
            description={`What Rakam signifies in Javanese divination, emphasizing its influence on one's inherent spiritual nature, social dynamics, and destiny regarding fortune.`}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Rakam"
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
              <h2 className="text-xl font-semibold text-left">Rakam</h2>
              <p className="text-sm text-gray-700 mb-2">
                Uncover the significant life themes or karmic imprints shaping
                your experiences.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.story}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="📜 The Story of Your Rakam"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.theme}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="🔶 How This Theme Shapes You"
            />
            <ContentSection
              reading={reading?.reading?.plot}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🌏 How the Plot Affects Your World"
            />
            <ContentSection
              reading={reading?.reading?.moral}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="😇 The Moral of Your Story"
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
              title={"Rakam"}
              topics={topics}
              description={`What Rakam signifies in Javanese divination, emphasizing its influence on one's inherent spiritual nature, social dynamics, and destiny regarding fortune.`}
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
