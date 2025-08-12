import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useQueryState } from "nuqs";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { convertToMarkdownList, getWetonEmojiScore } from "@/utils";
import { fetchProfileData } from "@/utils/fetch";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { ReadingLoadingSkeleton } from "@/components/readings/reading-loading-skeleton";
import { Capacitor } from "@capacitor/core";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";
import { AnimatedLoadingText } from "@/components/readings/AnimatedLoadingText";
import { useCompatibilityReading } from "@/utils/useReading";
import { coupleLoadingMessages } from "@/lib/loading-content";
import { ReadingSubscriptionButton } from "@/components/subscriptions/reading-subscription-button";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { ReadingDescription } from "@/components/readings/reading-description";

export default function DetailCompatibilityReading() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slug, setSlug] = useQueryState("slug");
  // const [reading, setReading] = useState(null);
  const [isSectionOneOpen, setIsSectionOneOpen] = useState(true);
  const [isSectionTwoOpen, setIsSectionTwoOpen] = useState(false);
  const [isSectionThreeOpen, setIsSectionThreeOpen] = useState(false);
  const [isSectionFourOpen, setIsSectionFourOpen] = useState(false);
  const [isSectionFiveOpen, setIsSectionFiveOpen] = useState(false);
  const [isSectionSixOpen, setIsSectionSixOpen] = useState(false);
  const [isSectionSevenOpen, setIsSectionSevenOpen] = useState(false);
  const [isSectionEightOpen, setIsSectionEightOpen] = useState(true);
  const [isSectionNineOpen, setIsSectionNineOpen] = useState(false);
  const [isSectionTenOpen, setIsSectionTenOpen] = useState(false);
  const [isSectionElevenOpen, setIsSectionElevenOpen] = useState(false);
  const [isSectionTwelveOpen, setIsSectionTwelveOpen] = useState(false);
  const [isSectionThirteenOpen, setIsSectionThirteenOpen] = useState(true);
  const [isSectionFourteenOpen, setIsSectionFourteenOpen] = useState(false);
  const [isSectionFifteenOpen, setIsSectionFifteenOpen] = useState(false);
  const [isSectionSixteenOpen, setIsSectionSixteenOpen] = useState(false);
  const [isSectionSeventeenOpen, setIsSectionSeventeenOpen] = useState(false);
  const [isSectionEighteenOpen, setIsSectionEighteenOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const topics = [
    {
      icon: "🌟",
      title: "Your Couple's Archetype",
      description:
        "Defines your unique archetype, top green flags, key growth edges, and the metaphorical essence of your combined energy.",
    },
    {
      icon: "📜",
      title: "The Traditional Path: Your Jodoh Reading",
      description:
        "A detailed interpretation of your compatibility based on the traditional Javanese divisions, revealing the core dynamics of your Jodoh.",
    },
    {
      icon: "⚡️",
      title: "Your Energetic Blend",
      description:
        "Explores your shared fortune and temperament through the Couple's Neptu, and describes your day-to-day vibe based on your combined days.",
    },
    {
      icon: "🤝",
      title: "Relational Dynamics: Strengths & Opportunities",
      description:
        "Details your areas of natural harmony and mutual growth, explaining how to cultivate Keselarasan (Harmony) in your relationship.",
    },
    {
      icon: "🌱",
      title: "Navigating Challenges & Cultivating Growth",
      description:
        "Identifies potential friction points and provides actionable strategies and conversation starters to navigate challenges constructively.",
    },
    {
      icon: "💎",
      title: "Concluding Wisdom & Empowerment",
      description:
        "Summarizes your unique journey with empowering wisdom on Usaha (Effort) and Bhakti (Devotion), affirming your power to build a beautiful life together.",
    },
  ];

  // Use SWR for data fetching. It handles caching, revalidation, and loading/error states.
  const {
    reading,
    isLoading,
    error: readingError,
  } = useCompatibilityReading(slug);

  // console.log(reading?.title);

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

  function getPartnerUsernameFromSlug(slug, currentUsername) {
    // Example slug: "syauqy-babi-couple" or "babi-syauqy-couple"
    if (!slug || !currentUsername) return null;
    const parts = slug.replace("-couple", "").split("-");
    // Remove current user's username
    const partner = parts.find((p) => p !== currentUsername);
    return partner || null;
  }

  // const fetchReading = useCallback(async () => {
  //   if (!slug) return;

  //   try {
  //     setLoading(true);
  //     const { data, error } = await supabase
  //       .from("readings")
  //       .select("id, status, reading, title, subtitle, reading_category, slug") // Ensure reading_category is fetched if needed for other logic
  //       .eq("slug", slug) // Match the username column with the slug
  //       .single();

  //     if (error) {
  //       console.error("Error fetching reading data:", error);
  //       return;
  //     }

  //     if (data) {
  //       setReading(data);
  //     }
  //   } catch (error) {
  //     console.error("Error in fetchReading:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [slug]);

  // useEffect(() => {
  //   fetchReading();
  // }, [fetchReading]);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    // Adjust the scroll threshold as needed
    setShowTitleInNavbar(scrollPosition > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fetchPartnerProfile = useCallback(async (partnerUsername) => {
    if (!partnerUsername) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, dina_pasaran, full_name, username")
        .eq("username", partnerUsername)
        .single();

      if (error) {
        console.error("Error fetching partner profile:", error);
        setPartnerProfile(null);
        return;
      }
      setPartnerProfile(data);
    } catch (err) {
      console.error("Error in fetchPartnerProfile:", err);
      setPartnerProfile(null);
    }
  }, []);

  useEffect(() => {
    if (slug && profileData?.username) {
      const partnerUsername = getPartnerUsernameFromSlug(
        slug,
        profileData.username
      );
      if (partnerUsername) {
        fetchPartnerProfile(partnerUsername);
      }
    }
  }, [slug, profileData?.username, fetchPartnerProfile]);

  const userAvatar =
    profileData?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profileData?.full_name || profileData?.username || "User"
    )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`;

  const partnerAvatar =
    partnerProfile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      partnerProfile?.full_name || partnerProfile?.username || "Partner"
    )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`;

  if (authLoading || (loading && !error)) {
    return <PageLoadingLayout />;
  }

  //   if (!profileData) {
  //     return (
  //       <NoProfileLayout
  //         router={router}
  //         profileData={profileData}
  //         showTitleInNavbar={showTitleInNavbar}
  //       />
  //     );
  //   }

  const readingContent = reading?.reading?.reading || reading?.reading; // Handle if reading.reading is an object or string
  // console.log(reading.reading, reading);
  //   console.log(user);
  // console.log(profileData, partnerProfile);

  const dayCombinationContent = `${readingContent?.blend?.dina?.vibe}

${readingContent?.blend?.dina?.weton_essence}

${readingContent?.blend?.dina?.interpretation}`;

  if (profileData?.subscription !== "pro") {
    return (
      <div className="min-h-screen bg-base-100 text-base-content font-sans">
        <ReadingNavbar
          title={"Love Compatibility"}
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"💖 Compatibility"}
            title={reading.title || "Compatibility Reading"}
            topics={topics}
            description={readingContent?.summary?.essence}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{reading?.title || "Compatibility Reading"} - Wetonscope</title>
        <meta
          name="description"
          content={
            reading?.subtitle ||
            `Detailed compatibility reading: ${reading?.title}`
          }
        />
      </Head>
      <div className="min-h-screen bg-base-100 text-base-content font-sans">
        <div
          className={`navbar px-5 bg-base-100 sticky top-0 z-50 transition-all duration-300 ${
            showTitleInNavbar ? "border-b border-batik-border" : ""
          }`}
        >
          <div className="navbar-start">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full text-xl border border-batik-text hover:bg-base-200"
            >
              <ArrowLeft size={20} className="text-batik-text" />
            </button>
          </div>
          {showTitleInNavbar && (
            <div className="navbar-center flex-col">
              <div className="text-xs text-batik-text font-semibold uppercase">
                Compatibility
              </div>
              <span className="text-batik-black font-semibold text-sm truncate max-w-xs">
                {reading?.title?.replace(/'s Compatibility$/, "")}
              </span>
            </div>
          )}
          <div className="navbar-end"></div>
        </div>

        {error ||
          (readingError && <ErrorLayout error={error} router={router} />)}

        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          {reading?.status === "completed" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-left">
                  {reading?.title || "Compatibility Reading"}
                </h2>
              </div>
              <section className={"pt-4 flex flex-col"}>
                <div className="mb-2">
                  <div className="avatar">
                    <div className="size-12 ring-2 ring-offset-2 ring-batik-border rounded-full overflow-hidden">
                      <img
                        src={userAvatar}
                        alt={profileData?.full_name || "User"}
                      />
                    </div>
                  </div>
                  <div className="avatar">
                    <div className="size-12 ring-2 ring-offset-2 ring-batik-border rounded-full overflow-hidden">
                      <img
                        src={partnerAvatar}
                        alt={partnerProfile?.full_name || "Partner"}
                      />
                    </div>
                  </div>
                </div>

                <div className="font-semibold text-batik-text">
                  Couple Archetype
                </div>
                <h2 className="text-lg font-semibold">
                  {readingContent?.summary?.archetype}
                </h2>
                <div className="text-gray-700">
                  {readingContent?.summary?.essence}
                </div>
                <div className="p-2 mt-2 rounded-2xl border-slate-200 border w-fit">
                  <div className="flex flex-row gap-1 text-sm font-medium">
                    <div>{getWetonEmojiScore(readingContent?.score)}</div>
                    <div>{readingContent?.score}%</div>
                    <div className="font-normal text-slate-600">
                      Compatibility
                    </div>
                  </div>
                </div>
              </section>

              <div className="mb-4 border-2 rounded-2xl border-gray-50 bg-gray-50 sticky top-[68px] z-50 shadow-sm">
                <nav className="grid grid-cols-3" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`${
                      activeTab === "overview"
                        ? "border-batik-text text-batik-black bg-batik-border/70 font-semibold"
                        : "border-transparent text-gray-500 hover:text-batik-text hover:border-batik-text"
                    } whitespace-nowrap py-2 px-4 rounded-2xl font-medium text-sm`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("dynamics")}
                    className={`${
                      activeTab === "dynamics"
                        ? "border-batik-text text-batik-black bg-batik-border/70 font-semibold"
                        : "border-transparent text-gray-500 hover:text-batik-text hover:border-batik-text"
                    } whitespace-nowrap py-2 px-4 rounded-2xl font-medium text-sm`}
                  >
                    Dynamics
                  </button>
                  <button
                    onClick={() => setActiveTab("challenges")}
                    className={`${
                      activeTab === "challenges"
                        ? "border-batik-text text-batik-black bg-batik-border/70 font-semibold"
                        : "border-transparent text-gray-500 hover:text-batik-text hover:border-batik-text"
                    } whitespace-nowrap py-2 px-4 rounded-2xl font-medium text-sm`}
                  >
                    Challenges
                  </button>
                </nav>
              </div>

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <ContentSection
                    reading={convertToMarkdownList(
                      readingContent?.summary?.strengths
                    )}
                    setIsSectionOpen={setIsSectionOneOpen}
                    isSectionOpen={isSectionOneOpen}
                    title="💚 Your Green Flags"
                    firstSection={true}
                  />
                  <ContentSection
                    reading={convertToMarkdownList(
                      readingContent?.summary?.challenges
                    )}
                    setIsSectionOpen={setIsSectionTwoOpen}
                    isSectionOpen={isSectionTwoOpen}
                    title="❤️‍🩹 Your Growth Edges"
                  />
                  <ContentSection
                    reading={readingContent?.deep_dive?.journey?.interpretation}
                    subtitle={readingContent?.deep_dive?.journey?.result}
                    setIsSectionOpen={setIsSectionFourOpen}
                    isSectionOpen={isSectionFourOpen}
                    title="🏠 The Path You Walk Together"
                  />
                  <ContentSection
                    reading={readingContent?.deep_dive?.fortune?.interpretation}
                    subtitle={readingContent?.deep_dive?.fortune?.result}
                    setIsSectionOpen={setIsSectionFiveOpen}
                    isSectionOpen={isSectionFiveOpen}
                    title="🍀 Prosperity & Well-being"
                  />
                  <ContentSection
                    reading={
                      readingContent?.deep_dive?.character?.interpretation
                    }
                    subtitle={readingContent?.deep_dive?.character?.result}
                    setIsSectionOpen={setIsSectionSixOpen}
                    isSectionOpen={isSectionSixOpen}
                    title="🤝 Social & Spiritual Synergy"
                  />
                  <ContentSection
                    reading={readingContent?.deep_dive?.destiny?.interpretation}
                    subtitle={readingContent?.deep_dive?.destiny?.result}
                    setIsSectionOpen={setIsSectionSevenOpen}
                    isSectionOpen={isSectionSevenOpen}
                    title="❤️ Couple Karmic Theme"
                  />
                </div>
              )}
              {activeTab === "dynamics" && (
                <div className="space-y-6">
                  <ContentSection
                    reading={readingContent?.blend?.neptu?.interpretation}
                    subtitle={readingContent?.blend?.neptu?.result}
                    setIsSectionOpen={setIsSectionEightOpen}
                    isSectionOpen={isSectionEightOpen}
                    title="♾️ Your Prosperity Paths"
                    firstSection={true}
                  />
                  <ContentSection
                    reading={dayCombinationContent}
                    setIsSectionOpen={setIsSectionNineOpen}
                    subtitle={readingContent?.blend?.dina?.result}
                    isSectionOpen={isSectionNineOpen}
                    title="🎶 The Rhythm of Your Days"
                  />
                  <ContentSection
                    reading={readingContent?.dynamics?.harmony}
                    setIsSectionOpen={setIsSectionTenOpen}
                    isSectionOpen={isSectionTenOpen}
                    title="🌊 Finding Your Flow"
                  />
                  <ContentSection
                    reading={readingContent?.dynamics?.mutual_growth}
                    setIsSectionOpen={setIsSectionElevenOpen}
                    isSectionOpen={isSectionElevenOpen}
                    title="🌱 Growing Together"
                  />
                  <ContentSection
                    reading={readingContent?.dynamics?.synergy}
                    setIsSectionOpen={setIsSectionTwelveOpen}
                    isSectionOpen={isSectionTwelveOpen}
                    title="✨ Better Together"
                  />
                </div>
              )}
              {activeTab === "challenges" && (
                <div className="space-y-6">
                  <ContentSection
                    reading={convertToMarkdownList(
                      readingContent?.challenges?.friction
                    )}
                    setIsSectionOpen={setIsSectionThirteenOpen}
                    isSectionOpen={isSectionThirteenOpen}
                    title="⚡️ Growth Hotspots"
                    firstSection={true}
                  />
                  <ContentSection
                    reading={readingContent?.challenges?.root_cause}
                    setIsSectionOpen={setIsSectionFourteenOpen}
                    isSectionOpen={isSectionFourteenOpen}
                    title='🔍 Decoding the "Why"'
                  />
                  <ContentSection
                    reading={convertToMarkdownList(
                      readingContent?.challenges?.strategies
                    )}
                    setIsSectionOpen={setIsSectionFifteenOpen}
                    isSectionOpen={isSectionFifteenOpen}
                    title="🗺️ Playbook for Harmony"
                  />
                  <ContentSection
                    reading={readingContent?.wisdom?.relationship_journey}
                    setIsSectionOpen={setIsSectionSixteenOpen}
                    isSectionOpen={isSectionSixteenOpen}
                    title="📖 The Story of Your Union"
                  />
                  <ContentSection
                    reading={readingContent?.insight}
                    setIsSectionOpen={setIsSectionSeventeenOpen}
                    isSectionOpen={isSectionSeventeenOpen}
                    title="💡 Insight for You"
                  />
                </div>
              )}
            </div>
          ) : reading?.status == "loading" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-left">
                  {profileData?.full_name.split(" ")[0]} &{" "}
                  {partnerProfile?.full_name.split(" ")[0]}'s Love
                </h2>
              </div>
              <div className="mb-2">
                <div className="avatar">
                  <div className="size-12 ring-2 ring-offset-2 ring-batik-border rounded-full overflow-hidden">
                    <img
                      src={userAvatar}
                      alt={profileData?.full_name || "User"}
                    />
                  </div>
                </div>
                <div className="avatar">
                  <div className="size-12 ring-2 ring-offset-2 ring-batik-border rounded-full overflow-hidden">
                    <img
                      src={partnerAvatar}
                      alt={partnerProfile?.full_name || "Partner"}
                    />
                  </div>
                </div>
              </div>
              <AnimatedLoadingText messages={coupleLoadingMessages} />
              <ReadingLoadingSkeleton />
            </div>
          ) : (
            !reading && (
              <div>
                <p className="text-gray-500">
                  No reading content available for this entry.
                </p>
                <button
                  onClick={() => router.back()}
                  className="btn btn-neutral mt-6"
                >
                  Go Back
                </button>
              </div>
            )
          )}
          {reading?.id && reading.status == "completed" && (
            <div>
              <FeedbackSession user={user} reading={reading} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
