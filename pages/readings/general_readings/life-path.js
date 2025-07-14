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

export default function LifePathPage() {
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

  useEffect(() => {
    if (profileData && user) {
      if (isNative) {
        fetchReading({
          profileData,
          user,
          setReading,
          setLoading,
          setError,
          slug: "life-path",
          reading_category: "general_readings",
          reading_type: "pro",
          api_url: "readings/general/general-pro-2",
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
        title="Life Path"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" ? (
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
          </div>
        ) : reading?.status === "pending" ? (
          <ReadingLoading />
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
        {reading?.id && <FeedbackSession user={user} reading={reading} />}
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
                  slug: "life-path",
                  reading_category: "general_readings",
                  reading_type: "pro",
                  api_url: "readings/general/general-pro-2",
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
