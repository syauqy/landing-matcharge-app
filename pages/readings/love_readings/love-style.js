import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import {
  fetchProfileData,
  handleGenerateReading,
  fetchReading,
} from "@/utils/fetch";
import { LoadingProfile } from "@/components/layouts/loading-profile";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { Capacitor } from "@capacitor/core";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ReadingDescription } from "@/components/readings/reading-description";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";

export default function LoveStylePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [isSectionOneOpen, setIsSectionOneOpen] = useState(true);
  const [isSectionTwoOpen, setIsSectionTwoOpen] = useState(false);
  const [isSectionThreeOpen, setIsSectionThreeOpen] = useState(false);
  const [isSectionFourOpen, setIsSectionFourOpen] = useState(false);
  const [isSectionFiveOpen, setIsSectionFiveOpen] = useState(false);
  const [isSectionSixOpen, setIsSectionSixOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const topics = [
    {
      icon: "🎁",
      title: "Primary Expression of Affection",
      description: "How do you naturally show love and care to a partner?",
    },
    {
      icon: "🤲",
      title: "Desired Received Affection",
      description: `How do you primarily wish to receive love from a partner?`,
    },
    {
      icon: "🏃",
      title: "Romantic Ideal & Pursuits",
      description:
        "What kind of romantic experience or partner do you inherently yearn for or seek out?",
    },
    {
      icon: "❤️‍🔥",
      title: "Demonstration of Passion",
      description:
        "How does your Weton influence the way you express passion or romantic intensity?",
    },
    {
      icon: "🧘",
      title: "Javanese Cultural Nuance",
      description:
        "Javanese cultural interpretations of love expression that might resonate with your Weton.",
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Or your app's login page
      return;
    }

    if (!router.isReady || !user) {
      setLoading(true);
      return;
    }

    fetchProfileData({ user, setLoading, setError, setProfileData });
  }, []);

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
  //         .eq("slug", "love-style")
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

  useEffect(() => {
    if (profileData && user) {
      if (isNative) {
        fetchReading({
          profileData,
          user,
          setReading,
          setLoading,
          setError,
          slug: "love-style",
          reading_category: "love_readings",
          reading_type: "basic",
          api_url: "readings/love/love-core",
        });
      }
    }
  }, [profileData]);

  // console.log("Profile Data:", profileData);

  if (authLoading || (loading && !error)) {
    return <LoadingProfile />;
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
        title="Love Style"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-left">Love Style</h2>
              <p className="text-sm text-gray-700 mb-2">
                Discover your natural way of expressing and receiving affection
                in relationships.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.primary_expression}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="🎁 Primary Expression of Affection"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.desired_affection}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="🤲 Desired Received Affection"
            />
            <ContentSection
              reading={reading?.reading?.romantic_ideal}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🏃 Romantic Ideal & Pursuits"
            />
            <ContentSection
              reading={reading?.reading?.demonstration_of_passion}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="❤️‍🔥 Demonstration of Passion"
            />
            <ContentSection
              reading={reading?.reading?.cultural_nuance}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="🧘 Javanese Cultural Nuance"
            />
          </div>
        ) : reading?.status === "pending" ? (
          <ReadingLoading />
        ) : (
          !reading && (
            <ReadingDescription
              reading_category={"💖 Love and Relationship"}
              title={"Love Style"}
              topics={topics}
              description={`This reading explores how you express and desire love, drawing from your Weton and Laku.`}
            />
          )
        )}
        {reading?.id && <FeedbackSession user={user} reading={reading} />}
      </main>
      {!reading && (
        <div className="fixed bottom-0 w-full p-2 pb-10 bg-base-100 border-batik-border shadow-[0px_-4px_12px_0px_rgba(0,_0,_0,_0.1)]">
          <button
            className="btn bg-rose-400 font-semibold text-white rounded-xl w-full"
            onClick={() =>
              handleGenerateReading({
                profileData,
                user,
                setReading,
                setLoading,
                setError,
                slug: "love-style",
                reading_category: "love_readings",
                reading_type: "basic",
                api_url: "readings/love/love-core",
              })
            }
          >
            Generate Reading
          </button>
        </div>
      )}
    </div>
  );
}
