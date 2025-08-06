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

export default function LoveCompatibilityPage() {
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
      icon: "🌿",
      title: "Energetic Harmony",
      description:
        "The general characteristics of Weton types that naturally create a harmonious energetic dynamic with your own.",
    },
    {
      icon: "🎯",
      title: "The Shared Values & Outlook",
      description: `Weton categories or qualities that suggest a shared outlook on life, similar core values, or a comparable approach to relationships.`,
    },
    {
      icon: "🌱",
      title: "Growth-Oriented Pairings",
      description:
        "Weton types that offer opportunities for significant mutual growth and balance through complementary energies.",
    },
    {
      icon: "🌊",
      title: "Positive Dynamics to Expect",
      description: "Explanation on how the compatibility exist.",
    },
    {
      icon: "🫶🏼",
      title: "Wisdom of Soulmate",
      description:
        "how these compatible Weton patterns might align with the traditional Javanese understanding of mutual compatibility.",
    },
  ];

  const loadingMessages = [
    {
      text: "Exploring your energetic harmony with others...",
      emoji: "🌿",
    },
    {
      text: "Identifying shared values and outlooks in relationships...",
      emoji: "🎯",
    },
    {
      text: "Discovering growth-oriented pairings for mutual development...",
      emoji: "🌱",
    },
    {
      text: "Uncovering positive dynamics you can expect in love...",
      emoji: "🌊",
    },
    {
      text: "Revealing the wisdom of soulmate connections...",
      emoji: "🫶🏼",
    },
    {
      text: "Analyzing how harmonious energies shape your love life...",
      emoji: "💞",
    },
    {
      text: "Assessing complementary traits for relationship balance...",
      emoji: "⚖️",
    },
    {
      text: "Evaluating how shared values foster deeper bonds...",
      emoji: "🤝",
    },
    {
      text: "Connecting traditional wisdom to modern compatibility...",
      emoji: "📜",
    },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "love_readings", "love-compatibility", "pro");

  const disclaimer =
    "These insights serve as a guide for self-understanding and for navigating relationships with greater awareness and wisdom, not as a rigid prediction of success or failure.";

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
  //         .eq("slug", "love-compatibility")
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

  // useEffect(() => {
  //   if (profileData && user) {
  //     if (isNative) {
  //       fetchReading({
  //         profileData,
  //         user,
  //         setReading,
  //         setLoading,
  //         setError,
  //         slug: "love-compatibility",
  //         reading_category: "love_readings",
  //         reading_type: "pro",
  //         api_url: "readings/love/love-pro",
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
          title="Compatible With"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"💖 Love and Relationship"}
            title={"Compatible With"}
            topics={topics}
            description={`This reading offers general insights into Weton patterns that tend to create harmonious or complementary relationships for you.`}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Compatible With"
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
                Compatible With
              </h2>
              <p className="text-sm text-gray-700 mb-2">
                Learn about Weton energies that naturally harmonize with your
                own in love.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.harmony}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="🌿 Energetic Harmony"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.values}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="🎯 The Shared Values & Outlook"
            />
            <ContentSection
              reading={reading?.reading?.growth}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🌱 Growth-Oriented Pairings"
            />
            <ContentSection
              reading={reading?.reading?.dynamic}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="🌊 Positive Dynamics to Expect"
            />
            <ContentSection
              reading={reading?.reading?.soulmate}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="🫶🏼 Wisdom of Soulmate"
            />
            <section className="p-4 border-slate-100 border rounded-2xl bg-base-100 shadow-md mt-10">
              <p className="text-sm text-gray-700">{disclaimer}</p>
            </section>
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
              reading_category={"💖 Love and Relationship"}
              title={"Compatible With"}
              topics={topics}
              description={`This reading offers general insights into Weton patterns that tend to create harmonious or complementary relationships for you.`}
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
                apiUrl: "readings/love/love-pro",
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
