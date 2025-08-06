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

export default function AttachmentStylePage() {
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
      icon: "💖",
      title: "Your Heart's Default Setting",
      description:
        "Your primary disposition towards closeness and emotional connection based on your Weton and Laku.",
    },
    {
      icon: "💕",
      title: "How You Handle Closeness",
      description: `How does your Weton influence your comfort levels with deep intimacy, emotional sharing, and vulnerability in a relationship.`,
    },
    {
      icon: "↔️",
      title: "Response to Distance & Space",
      description:
        "How do you typically react when a partner needs space or when there's a perceived distance in the relationship.",
    },
    {
      icon: "⚖️",
      title: "Your We vs Me Balance",
      description:
        "Your natural leanings regarding dependency within a partnership.",
    },
    {
      icon: "🖇️",
      title: "Mutual Completion",
      description: `Connection to the Javanese wisdom of "eling lan waspada", suggesting that the potential challenges allows for proactive and mindful relationship building.`,
    },
  ];

  const disclaimer =
    "These insights serve as a guide for self-understanding and for navigating relationships with greater awareness and wisdom, not as a rigid prediction of success or failure.";

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
  //         .eq("reading_category", "love_readings")
  //         .eq("slug", "attachment-style")
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
  //           const response = await axios.post(
  //             `${config.api.url}/readings/love/love-pro-2`,
  //             { profile: profileData },
  //             {
  //               headers: { "Content-Type": "application/json" },
  //             }
  //           );

  //           setReading(response);
  //           setLoading(false);
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
          slug: "attachment-style",
          reading_category: "love_readings",
          reading_type: "pro",
          api_url: "readings/love/love-pro-2",
        });
      }
    }
  }, [profileData]);

  // console.log("Profile Data:", profileData);

  if (authLoading || (loading && !error)) {
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
          title="Attachment Style"
          profileData={profileData}
          showTitleInNavbar={showTitleInNavbar}
        />
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <ReadingDescription
            reading_category={"💖 Love and Relationship"}
            title={"Attachment Style"}
            topics={topics}
            description={`This reading explores your inherent tendencies in forming bonds and navigating intimacy within relationships, drawing from your Weton, Laku, and Wuku.`}
          />
        </main>
        <ReadingSubscriptionButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <ReadingNavbar
        title="Attachment Style"
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />

      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-left">
                Attachment Style
              </h2>
              <p className="text-sm text-gray-700 mb-2">
                Gain insight into how you form bonds and connect emotionally
                with partners.
              </p>
            </div>
            <ContentSection
              reading={reading?.reading?.core_bonding}
              setIsSectionOpen={setIsSectionOneOpen}
              isSectionOpen={isSectionOneOpen}
              title="💖 Your Heart's Default Setting"
              firstSection={true}
            />
            <ContentSection
              reading={reading?.reading?.comfort}
              setIsSectionOpen={setIsSectionTwoOpen}
              isSectionOpen={isSectionTwoOpen}
              title="💕 How You Handle Closeness"
            />
            <ContentSection
              reading={reading?.reading?.space}
              setIsSectionOpen={setIsSectionThreeOpen}
              isSectionOpen={isSectionThreeOpen}
              title="↔️ Response to Distance & Space"
            />
            <ContentSection
              reading={reading?.reading?.dependency}
              setIsSectionOpen={setIsSectionFourOpen}
              isSectionOpen={isSectionFourOpen}
              title="⚖️ Your We vs Me Balance"
            />
            <ContentSection
              reading={reading?.reading?.jodoh}
              setIsSectionOpen={setIsSectionFiveOpen}
              isSectionOpen={isSectionFiveOpen}
              title="🖇️ Mutual Completion"
            />
            <section className="p-4 border-slate-100 border rounded-2xl bg-base-100 shadow-md mt-10">
              <p className="text-sm text-gray-700">{disclaimer}</p>
            </section>
            {reading?.id && <FeedbackSession user={user} reading={reading} />}
          </div>
        ) : reading?.status === "loading" ? (
          <ReadingLoading />
        ) : (
          !reading && (
            <ReadingDescription
              reading_category={"💖 Love and Relationship"}
              title={"Attachment Style"}
              topics={topics}
              description={`This reading explores your inherent tendencies in forming bonds and navigating intimacy within relationships, drawing from your Weton, Laku, and Wuku.`}
            />
          )
        )}
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
                slug: "attachment-style",
                reading_category: "love_readings",
                reading_type: "pro",
                api_url: "readings/love/love-pro-2",
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
