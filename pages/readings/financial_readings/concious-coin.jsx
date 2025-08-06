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
import { DisclaimerSection } from "@/components/readings/disclaimer-section";
import { ReadingSubscriptionButton } from "@/components/subscriptions/reading-subscription-button";
import { AnimatedLoadingText } from "@/components/readings/AnimatedLoadingText";
import { useReading } from "@/utils/useReading";
import { ReadingLoadingSkeleton } from "@/components/readings/reading-loading-skeleton";

export default function ConciousCoinPage() {
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
      icon: "💸",
      title: "Aligning Spending with Your Soul",
      description: `Your Weton energy connection with your financial tendency."`,
    },
    {
      icon: "🌟",
      title: "Your Core Values",
      description: `Identify your primary virtues as your soul's core values.`,
    },
    {
      icon: "🎖️",
      title: "Budget that Honors You",
      description: `Guidance for you to think about your financial spending through the lens of your values.`,
    },
    {
      icon: "🎁",
      title: "Art of Mindful Giving",
      description: `Gentle guidance on how you can express your nature through generosity.`,
    },
    {
      icon: "🧭",
      title: "A Guiding Philosophy",
      description: `Connection with Javanese context of 'Memayu Hayuning Bawana' or a commitment to beautifying the beauty of the world through your wealth.`,
    },
  ];

  // adjust the data according to topics const above, min 9 objects. Change the emoji based on the text
  const loadingMessages = [
    {
      text: "Aligning your spending with your soul’s purpose...",
      emoji: "💸",
    },
    {
      text: "Identifying your core financial values...",
      emoji: "🌟",
    },
    {
      text: "Creating a budget that honors your true self...",
      emoji: "🎖️",
    },
    {
      text: "Exploring the art of mindful giving...",
      emoji: "🎁",
    },
    {
      text: "Connecting to a guiding financial philosophy...",
      emoji: "🧭",
    },
    {
      text: "Reflecting on your financial priorities...",
      emoji: "📝",
    },
    {
      text: "Discovering your unique wealth tendencies...",
      emoji: "🔍",
    },
    {
      text: "Uncovering opportunities for soulful abundance...",
      emoji: "🌱",
    },
    {
      text: "Synthesizing your conscious coin profile...",
      emoji: "💰",
    },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "financial_readings", "concious-coin", "pro");

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
  //         slug: "concious-coin",
  //         reading_category: "financial_readings",
  //         reading_type: "pro",
  //         api_url: "readings/financial/financial-pro",
  //       });
  //     }
  //   }
  // }, [profileData]);

  const disclaimer =
    "This guidance offers insights into your inherent predispositions, but your conscious choices and actions ultimately shape your financial reality.";

  // console.log("Profile Data:", profileData, authLoading, loading, error);

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
          title="Conscious Coin"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"💰 Financial Fortune"}
            title={"Conscious Coin"}
            topics={topics}
            description={
              "This reading helps you create a budget and spending plan that reflects their deepest personal values, turning financial decisions into acts of personal integrity."
            }
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Conscious Coin"
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
                Conscious Coin
              </h2>
              <p className="text-sm text-gray-700 mb-2">
                Understand your spending style that reflects your values and
                priorities.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.introduction}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="💸 Aligning Spending with Your Soul"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.values}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="🌟 Your Core Values"
            />
            <ContentSection
              reading={reading?.reading?.budget}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🎖️ Budget that Honors You"
            />
            <ContentSection
              reading={reading?.reading?.mindful}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="🎁 Art of Mindful Giving"
            />
            <ContentSection
              reading={reading?.reading?.philosophy}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="🧭 A Guiding Philosophy"
            />
            {reading?.id && (
              <div>
                <FeedbackSession user={user} reading={reading} />
                <DisclaimerSection
                  title={
                    "These are energetic tendencies, not absolute predictions"
                  }
                  description={disclaimer}
                />
              </div>
            )}
          </div>
        ) : reading?.status === "loading" ? (
          <>
            <AnimatedLoadingText messages={loadingMessages} />
            <ReadingLoadingSkeleton />
          </>
        ) : (
          !reading && (
            <ReadingDescription
              reading_category={"💰 Financial Fortune"}
              title={"Conscious Coin"}
              topics={topics}
              description={
                "This reading helps you create a budget and spending plan that reflects their deepest personal values, turning financial decisions into acts of personal integrity."
              }
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
                apiUrl: "readings/financial/financial-pro",
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
