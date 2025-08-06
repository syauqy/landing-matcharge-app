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
      icon: "💪",
      title: "Professional Strength & Aptitudes",
      description:
        "How your Weton provide insights into your natural talents, professional predispositions, and the working environment.",
    },
    {
      icon: "🏕️",
      title: "Ideat Work Environment",
      description: `Specific qualities that make you effective in a professional setting.`,
    },
    {
      icon: "📣",
      title: "Leadership & Collaboration Style",
      description:
        "Types of professional settings or industries where your Weton suggests you would feel most aligned and productive.",
    },
    {
      icon: "⚠️",
      title: "Potential Career Challenges",
      description:
        "How do you naturally approach leadership and working with others.",
    },
    {
      icon: "✍🏼",
      title: "The Path of Working Diligently",
      description: `Your career insights to the Javanese concept of 'makarya' or working diligently.`,
    },
  ];

  // adjust the data according to topics const above, min 9 objects. Change the emoji based on the text

  const loadingMessages = [
    {
      text: "Analyzing your professional strengths and natural aptitudes...",
      emoji: "💪",
    },
    {
      text: "Exploring your ideal work environment for maximum productivity...",
      emoji: "🏕️",
    },
    {
      text: "Assessing your leadership and collaboration style in teams...",
      emoji: "📣",
    },
    {
      text: "Identifying potential career challenges and growth areas...",
      emoji: "⚠️",
    },
    {
      text: "Reflecting on your path of working diligently (makarya)...",
      emoji: "✍🏼",
    },
    {
      text: "Uncovering your adaptability in changing professional settings...",
      emoji: "🔄",
    },
    {
      text: "Evaluating your communication skills and influence at work...",
      emoji: "🗣️",
    },
    {
      text: "Understanding your motivation and drive for career success...",
      emoji: "🚀",
    },
    {
      text: "Connecting Javanese wisdom to your career purpose and fulfillment...",
      emoji: "🌾",
    },
  ];

  const {
    reading,
    isLoading: isLoadingReading,
    error: readingError,
  } = useReading(user?.id, "work_readings", "your-career", "pro");

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
  //         .eq("reading_category", "work_readings")
  //         .eq("slug", "your-career")
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
  //             `${config.api.url}/readings/work/work-pro`,
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
  //         slug: "your-career",
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
          title="Your Career"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"💼 Work, Career, and Purpose"}
            title={"Your Career"}
            topics={topics}
            description={`This reading delves into your inherent professional aptitudes, work ethic, leadership style, and potential for success, as shaped by your birth Weton, Laku, and Rakam.`}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Your Career"
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
              <h2 className="text-xl font-semibold text-left">Your Career</h2>
              <p className="text-sm text-gray-700 mb-2">
                Explore professions and work styles that resonate with your
                Weton&apos;s energy.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.strengths}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="💪 Professional Strength & Aptitudes"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.ideal_work}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="🏕️ Ideat Work Environment"
            />
            <ContentSection
              reading={reading?.reading?.leadership}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="📣 Leadership & Collaboration Style"
            />
            <ContentSection
              reading={reading?.reading?.challenges}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="⚠️ Potential Career Challenges"
            />
            <ContentSection
              reading={reading?.reading?.makarya}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="✍🏼 The Path of Working Diligently"
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
              title={"Your Career"}
              topics={topics}
              description={`This reading delves into your inherent professional aptitudes, work ethic, leadership style, and potential for success, as shaped by your birth Weton, Laku, and Rakam.`}
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
