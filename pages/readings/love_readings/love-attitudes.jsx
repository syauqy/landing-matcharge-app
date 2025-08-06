import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { fetchProfileData, handleGenerateReading } from "@/utils/fetch";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { Capacitor } from "@capacitor/core";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ReadingDescription } from "@/components/readings/reading-description";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";
import { ReadingLoadingSkeleton } from "@/components/readings/reading-loading-skeleton";
import { AnimatedLoadingText } from "@/components/readings/AnimatedLoadingText";
import { useReading } from "@/utils/useReading";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";

export default function LoveAttitudesPage() {
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
  const [isSectionSixOpen, setIsSectionSixOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const [isGenerating, setIsGenerating] = useState(false);

  const topics = [
    {
      icon: "💍",
      title: "View on Commitment",
      description:
        "Your intrinsic perspective on commitment and long-term relationships.",
    },
    {
      icon: "⚖️",
      title: "Approach to Conflict & Disagreement",
      description: `How do you typically tend to handle disagreements or challenges in a relationship?`,
    },
    {
      icon: "🛡️",
      title: "Trust, Loyalty, & Fidelity",
      description:
        "Your inherent tendencies and values regarding trust, loyalty, and fidelity within a partnership.",
    },
    {
      icon: "☯️",
      title: "Independence vs. Interdependence",
      description:
        "How do you naturally balance your personal autonomy and need for individual space with the desire for relational closeness and shared life?",
    },
    {
      icon: "🧘",
      title: "Javanese Philosophical Connection",
      description:
        "How the concept of keselarasan (harmony) might manifest in your attitudes towards resolving differences and maintaining peace.",
    },
  ];

  const loadingMessages = [
    { text: "Exploring your view on commitment...", emoji: "💍" },
    {
      text: "Analyzing your approach to conflict & disagreement...",
      emoji: "⚖️",
    },
    {
      text: "Uncovering your trust, loyalty, & fidelity tendencies...",
      emoji: "🛡️",
    },
    { text: "Balancing independence vs. interdependence...", emoji: "☯️" },
    { text: "Connecting with Javanese philosophical harmony...", emoji: "🧘" },
    { text: "Reflecting on your relationship journey...", emoji: "💖" },
    { text: "Interpreting your Weton and Rakam synergy...", emoji: "🔮" },
    { text: "Understanding your emotional foundation...", emoji: "⚓" },
    { text: "Synthesizing your unique love attitudes...", emoji: "🪷" },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "love_readings", "love-attitudes", "basic");

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
  //         .eq("user_id", user.id)
  //         .eq("reading_category", "love_readings")
  //         .eq("slug", "love-attitudes")
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
  //             `${config.api.url}/readings/love/love-core`,
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
  //         slug: "love-attitudes",
  //         reading_category: "love_readings",
  //         reading_type: "basic",
  //         api_url: "readings/love/love-core",
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

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Love Attitudes"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {error || (readingError && <ErrorLayout error={error} router={router} />)}

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
                Love Attitudes
              </h2>
              <p className="text-sm text-gray-700 mb-2">
                Uncover your underlying beliefs and perspectives when it comes
                to romance.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.commitment}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="💍 View on Commitment"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.conflict}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="⚖️ Approach to Conflict & Disagreement"
            />
            <ContentSection
              reading={reading?.reading?.trust}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🛡️ Trust, Loyalty, & Fidelity"
            />
            <ContentSection
              reading={reading?.reading?.interdependence}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="☯️ Independence vs. Interdependence"
            />
            <ContentSection
              reading={reading?.reading?.harmony}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="🧘 Javanese Cultural Nuance"
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
              reading_category={"💖 Love and Relationship"}
              title={"Love Attitudes"}
              topics={topics}
              description={`This reading examines your inherent beliefs and perspectives on love, commitment, and relationships, shaped by your Weton and Rakam.`}
            />
          )
        )}
      </main>
      {!isLoadingReading && !reading && (
        <div className="fixed bottom-0 w-full p-2 pb-10 bg-base-100 border-batik-border shadow-[0px_-4px_12px_0px_rgba(0,_0,_0,_0.1)]">
          <button
            className="btn bg-rose-400 disabled:bg-slate-300 font-semibold text-white rounded-xl w-full"
            disabled={isGenerating}
            onClick={() =>
              handleGenerateReading({
                profileData,
                user,
                apiUrl: "readings/love/love-core",
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
