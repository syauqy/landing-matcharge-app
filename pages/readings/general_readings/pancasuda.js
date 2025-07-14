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

export default function SaptawaraPage() {
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
  const isNative = Capacitor.isNativePlatform();

  const topics = [
    {
      icon: "🦹‍♂️",
      title: "Core Character & Symbolism",
      description:
        "Detail the fundamental temperament and key symbolic associations linked to this Pancasuda.",
    },
    {
      icon: "🎁",
      title: "Your Innate Gift",
      description: `Outline the primary positive traits and potential areas for growth or caution that are characteristic of this Pancasuda.`,
    },
    {
      icon: "🌓",
      title: "Your Shadow Side",
      description:
        "Describe how this Pancasuda generally influences your life path, ambition, or overarching sense of purpose.",
    },
    {
      icon: "💪",
      title: "Putting Your Gift to Work",
      description:
        "Actionable advice on how you can align with and best leverage for personal well-being, success, and fulfilling your life's path.",
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
  //         .eq("reading_type", "pro")
  //         .eq("user_id", user.id)
  //         .eq("reading_category", "general_readings")
  //         .eq("slug", "pancasuda")
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
  //             `${config.api.url}/readings/general/general-pro-1`,
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
          slug: "pancasuda",
          reading_category: "general_readings",
          reading_type: "pro",
          api_url: "readings/general/general-pro-1",
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
        title="Pancasuda"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-left">Pancasuda</h2>
              <p className="text-sm text-gray-700 mb-2">
                Reveal the core pillar of your inner foundation and its
                potential influenced by the seven-day Pawukon cycle.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.character}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="🦹‍♂️ Core Character & Symbolism"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.innate_gift}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="🎁 Your Innate Gift"
            />
            <ContentSection
              reading={reading?.reading?.shadow}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="🌓 Your Shadow Side"
            />
            <ContentSection
              reading={reading?.reading?.gift_to_work}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="💪 Putting Your Gift to Work"
            />
          </div>
        ) : reading?.status === "pending" ? (
          <ReadingLoading />
        ) : (
          !reading && (
            <ReadingDescription
              reading_category={"🔮 Personal"}
              title={"Pancasuda"}
              topics={topics}
              description={`Explores your Pancasuda (the seven-day cycle), which reveals fundamental aspects of your personality, general temperament, and overarching life purpose.`}
            />
          )
        )}

        {/* {!isNative && (
          <section>
            <div className="flex flex-col gap-4">
              <button
                className="btn border-batik-border text-batik-text rounded-2xl"
                onClick={handleGenerateReading}
              >
                Generate Reading
              </button>
              {reading && (
                <div className="flex flex-col">
                  <div className="text-sm font-semibold  text-batik-text">
                    Saptawara
                  </div>

                  <ReactJsonView
                    src={reading}
                    theme="bright:inverted"
                    displayObjectSize={false}
                    className="rounded-2xl"
                    displayDataTypes={false}
                  />
                </div>
              )}
            </div>
          </section>
        )} */}
      </main>
      {!reading && (
        <div className="fixed bottom-0 w-full p-2 pb-10 bg-base-100 border-batik-border shadow-[0px_-4px_12px_0px_rgba(0,_0,_0,_0.1)]">
          {profileData?.subscription == "pro" ? (
            <button
              className="btn bg-rose-400 font-semibold text-white rounded-xl w-full"
              onClick={() =>
                handleGenerateReading({
                  profileData,
                  user,
                  setReading,
                  setLoading,
                  setError,
                  slug: "pancasuda",
                  reading_category: "general_readings",
                  reading_type: "pro",
                  api_url: "readings/general/general-pro-1",
                })
              }
            >
              Generate Reading
            </button>
          ) : (
            <button
              className="btn bg-amber-600 font-semibold text-white rounded-xl w-full"
              onClick={() => {}}
            >
              🔓 Unlock With Pro
            </button>
          )}
        </div>
      )}
    </div>
  );
}
