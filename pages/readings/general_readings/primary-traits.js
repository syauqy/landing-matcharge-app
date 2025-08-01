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
import { ChevronDown } from "lucide-react";
import { ReadingDescription } from "@/components/readings/reading-description";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { LoadingProfile } from "@/components/layouts/loading-profile";
import { ErrorLayout } from "@/components/layouts/error-page";
import { Capacitor } from "@capacitor/core";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { ContentSection } from "@/components/readings/content-section";
import { PromotionBanner } from "@/components/readings/promotion-banner";
import { FeedbackSession } from "@/components/readings/feedback-section";

export default function PrimaryTraitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [isTraitsSectionOpen, setIsTraitsSectionOpen] = useState(false);
  const [isInfluenceSectionOpen, setIsInfluenceSectionOpen] = useState(false);
  const [isWisdomSectionOpen, setIsWisdomSectionOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const topics = [
    {
      icon: "🌀",
      title: "Weton Identity",
      description: "What are the traditional elements of your weton identity?",
    },
    {
      icon: "🎭",
      title: "The Personality Archetype",
      description: `The overall dispositions, strengths, and areas for growth associated with this Weton.`,
    },
    {
      icon: "🌊",
      title: "Weton's Influence on Life",
      description:
        "Know your emotional, social & relational dynamics, work, career, financial, and health.",
    },
    {
      icon: "🧘🏻‍♀️",
      title: "Your Weton's Wisdom",
      description:
        "Embrace Your unique Weton characteristics for personal growth and fulfillment.",
    },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
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
          slug: "primary-traits",
          reading_category: "general_readings",
          reading_type: "basic",
          api_url: "readings/general/primary-traits",
        });
      }
    }
  }, [profileData]);

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

  console.log(reading);

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Primary Traits"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-left">
                Primary Traits
              </h1>
              <p className="text-sm text-gray-700 mb-2">
                Identify your most prominent strengths and inherent
                characteristics.
              </p>
            </div>
            <section>
              <div className="flex flex-col gap-8">
                <div className="text-slate-600">
                  <div className="text-batik-text font-semibold">
                    🌀 Weton Identity
                  </div>
                  <div className="text-gray-700">
                    {reading?.reading?.weton_identity?.element}
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-batik-border pt-4">
              <button
                onClick={() => setIsTraitsSectionOpen(!isTraitsSectionOpen)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">Your Traits</h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isTraitsSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isTraitsSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col">
                      <div className="font-semibold text-batik-text">
                        🎭 Character
                      </div>
                      <div className="text-lg font-semibold">
                        {profileData.weton?.laku?.name}
                      </div>
                      <div className="text-gray-700">
                        {reading?.reading?.characters?.laku}
                      </div>
                      <div className="text-gray-700 mt-2">
                        {reading?.reading?.symbol?.philosophy}
                      </div>
                      <PromotionBanner
                        title={`Learn More about ${profileData.weton?.laku?.name}`}
                        content="Discover the archetype and behavioral pattern that guides your life's journey."
                        url={"/readings/general_readings/laku"}
                        pro={true}
                        icon={"🎭"}
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold text-batik-text">
                        💪 Inherent Strengths
                      </div>
                      <ul className="list-disc list-outside text-gray-700 ml-5">
                        {reading?.reading?.characters?.strength?.map((s, i) => (
                          <li key={i} className="text-gray-700">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold text-batik-text">
                        🌱 Areas for Growth
                      </div>
                      <ul className="list-disc list-outside text-gray-700 ml-5">
                        {reading?.reading?.characters?.growth?.map((g, i) => (
                          <li key={i} className="text-gray-700">
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-batik-border pt-4">
              <button
                onClick={() =>
                  setIsInfluenceSectionOpen(!isInfluenceSectionOpen)
                }
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">
                  Weton&apos;s Influence on Life
                </h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isInfluenceSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isInfluenceSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col">
                      <div className="font-semibold  text-batik-text">
                        🌊 Emotional Nature
                      </div>
                      <div className="text-gray-700">
                        {reading?.reading?.influences?.emotion}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold  text-batik-text">
                        💬 Social Interactions
                      </div>
                      <div className="text-gray-700">
                        {reading?.reading?.influences?.social}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold  text-batik-text">
                        👔 Work Ethics
                      </div>
                      <div className="text-gray-700">
                        {reading?.reading?.influences?.work}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold  text-batik-text">
                        💵 Financial Tendencies
                      </div>
                      <div className="text-gray-700">
                        {reading?.reading?.influences?.financial}
                      </div>
                      <PromotionBanner
                        title={`Know Financial Traits`}
                        content="Understand your natural approach to wealth, and financial opportunities."
                        url={"/readings/financials_readings/your-financial"}
                        pro={true}
                        icon={"💰"}
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="font-semibold  text-batik-text">
                        🧘🏻‍♀️ Health
                      </div>
                      <div className="text-gray-700">
                        {reading?.reading?.influences?.health}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-y border-batik-border pt-4 pb-6">
              <button
                onClick={() => setIsWisdomSectionOpen(!isWisdomSectionOpen)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold text-left">
                  Embracing Your Weton&apos;s Wisdom
                </h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isWisdomSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isWisdomSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col">
                      <div className="font-semibold  text-batik-text">
                        🤔 Reflection
                      </div>
                      <div className="text-gray-700">
                        {reading?.reading?.wisdom?.reflection}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold  text-batik-text">
                        💌 Message For You
                      </div>
                      <div className="text-gray-700">
                        {reading?.reading?.wisdom?.empowerment}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {reading?.id && (
              <FeedbackSession
                user={user}
                supabase={supabase}
                reading={reading}
              />
            )}
          </div>
        ) : reading?.status === "loading" ? (
          <ReadingLoading />
        ) : (
          !reading && (
            <ReadingDescription
              reading_category={"🔮 Personal"}
              title={"Primary Traits"}
              topics={topics}
              description={`Identify your most prominent strengths and inherent characteristics.`}
            />
          )
        )}
      </main>
      {!reading && (
        <div className="fixed bottom-0 w-full p-2 bg-base-100 border-batik-border shadow-[0px_-4px_12px_0px_rgba(0,_0,_0,_0.1)]">
          <button
            className="btn bg-rose-400 font-semibold text-white rounded-xl w-full"
            onClick={() =>
              handleGenerateReading({
                profileData,
                user,
                setReading,
                setLoading,
                setError,
                slug: "primary-traits",
                reading_category: "general_readings",
                reading_type: "basic",
                api_url: "readings/general/primary-traits",
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
