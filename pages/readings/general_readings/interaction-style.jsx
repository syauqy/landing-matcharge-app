import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { fetchProfileData, handleGenerateReading } from "@/utils/fetch";
import { ReadingDescription } from "@/components/readings/reading-description";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { LoadingProfile } from "@/components/layouts/loading-profile";
import { ErrorLayout } from "@/components/layouts/error-page";
import { Capacitor } from "@capacitor/core";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ContentSection } from "@/components/readings/content-section";
import { ReadingSubscriptionButton } from "@/components/subscriptions/reading-subscription-button";
import { AnimatedLoadingText } from "@/components/readings/AnimatedLoadingText";
import { useReading } from "@/utils/useReading";
import { ReadingLoadingSkeleton } from "@/components/readings/reading-loading-skeleton";

export default function InteractionPage() {
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
      icon: "🥂",
      title: "Dominant Social Tendency",
      description: "Are you naturally more introverted or extroverted?",
    },
    {
      icon: "📣",
      title: "Communication Patterns",
      description: "How do you tend to convey your thoughts and feelings?",
    },
    {
      icon: "🤝",
      title: "Approach to Partnership",
      description:
        "How do you typically initiate, maintain, and navigate friendships, professional connections, and community ties?",
    },
    {
      icon: "🤹",
      title: "Handling Social Dynamics",
      description:
        "How do you typically react to social challenges, group pressures, or differing opinions?",
    },
    {
      icon: "🙏",
      title: "Social Etiquette",
      description:
        "Connect aspects of your interaction style to relevant Javanese tata krama (etiquette) or social norms.",
    },
  ];

  const loadingMessages = [
    {
      text: "Analyzing your dominant social tendency...",
      emoji: "🥂",
    },
    {
      text: "Exploring your introversion or extroversion traits...",
      emoji: "🔍",
    },
    {
      text: "Examining your communication patterns...",
      emoji: "📣",
    },
    {
      text: "Understanding how you convey thoughts and feelings...",
      emoji: "💬",
    },
    {
      text: "Assessing your approach to partnership and connections...",
      emoji: "🤝",
    },
    {
      text: "Reviewing how you initiate and maintain relationships...",
      emoji: "🌱",
    },
    {
      text: "Evaluating your handling of social dynamics and challenges...",
      emoji: "🤹",
    },
    {
      text: "Identifying your reactions to group pressures and opinions...",
      emoji: "🧠",
    },
    {
      text: "Connecting your interaction style to Javanese social etiquette...",
      emoji: "🙏",
    },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "general_readings", "interaction-style", "pro");

  const disclaimer =
    "While Weton provides valuable insights into inherent tendencies and energetic dynamics, it does not dictate absolute destinies or outcomes in relationships. These insights serve as a guide for self-understanding and for navigating relationships with greater awareness and wisdom, not as a rigid prediction of success or failure. Human agency, conscious effort, open communication, and genuine love are paramount. Every relationship is a unique journey of two individuals, and challenges can always be overcome with dedication.";

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

  // useEffect(() => {
  //   if (profileData && user) {
  //     if (isNative) {
  //       fetchReading({
  //         profileData,
  //         user,
  //         setReading,
  //         setLoading,
  //         setError,
  //         slug: "interaction-style",
  //         reading_category: "general_readings",
  //         reading_type: "pro",
  //         api_url: "readings/general/general-pro-2",
  //       });
  //     }
  //   }
  // }, [profileData]);

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
          title="Interaction Style"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"🔮 Personal"}
            title={"Interaction Style"}
            topics={topics}
            description={`This reading is your social "user manual." It's a practical guide to how you show up in social situations and how to build better connections by understanding your own communication patterns.`}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Interaction Style"
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
                Interaction Style
              </h2>
              <p className="text-sm text-gray-700 mb-2">
                Learn how you naturally connect and communicate with the world
                around you.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.social_tendency}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="🥂 Dominant Social Tendency"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.communication}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="📣 Communication Patterns"
            />
            <ContentSection
              reading={reading?.reading?.relationship}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🤝 Approach to Partnership"
            />
            <ContentSection
              reading={reading?.reading?.social_dynamics}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="🤹 Handling Social Dynamics"
            />
            <ContentSection
              reading={reading?.reading?.social_etiquette}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="🙏 Social Etiquette"
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
              title={"Interaction Style"}
              topics={topics}
              description={`This reading is your social "user manual." It's a practical guide to how you show up in social situations and how to build better connections by understanding your own communication patterns.`}
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
