import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import {
  fetchProfileData,
  handleGenerateReading,
  fetchReading,
} from "@/utils/fetch";
import { ReadingDescription } from "@/components/readings/reading-description";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { LoadingProfile } from "@/components/layouts/loading-profile";
import { ErrorLayout } from "@/components/layouts/error-page";
import { Capacitor } from "@capacitor/core";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ContentSection } from "@/components/readings/content-section";

export default function InteractionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("error banget");
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

  const disclaimer =
    "While Weton provides valuable insights into inherent tendencies and energetic dynamics, it does not dictate absolute destinies or outcomes in relationships. These insights serve as a guide for self-understanding and for navigating relationships with greater awareness and wisdom, not as a rigid prediction of success or failure. Human agency, conscious effort, open communication, and genuine love are paramount. Every relationship is a unique journey of two individuals, and challenges can always be overcome with dedication.";

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

  useEffect(() => {
    if (profileData && user) {
      if (isNative) {
        fetchReading({
          profileData,
          user,
          setReading,
          setLoading,
          setError,
          slug: "interaction-style",
          reading_category: "general_readings",
          reading_type: "pro",
          api_url: "readings/general/general-pro-2",
        });
      }
    }
  }, [profileData]);

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

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content">
        <ReadingNavbar
          title="Interaction Style"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <LoadingProfile />
      </div>
    );
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
        title="Interaction Style"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" ? (
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
          </div>
        ) : reading?.status === "pending" ? (
          <ReadingLoading />
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
                  slug: "interaction-style",
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
