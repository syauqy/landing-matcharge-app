import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fetchProfileData } from "@/utils/fetch";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { Capacitor } from "@capacitor/core";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ReadingDescription } from "@/components/readings/reading-description";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";
import { DisclaimerSection } from "@/components/readings/disclaimer-section";
import { getJavaneseDate } from "@/utils";
import Markdown from "markdown-to-jsx";
import clsx from "clsx";

export default function MonthlyReadingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [reading, setReading] = useState([]);
  const [requestMonthlyReading, setRequestMonthlyReading] = useState(false);
  const [isSectionOneOpen, setIsSectionOneOpen] = useState(true);
  const [isSectionTwoOpen, setIsSectionTwoOpen] = useState(false);
  const [isSectionThreeOpen, setIsSectionThreeOpen] = useState(false);
  const [isSectionFourOpen, setIsSectionFourOpen] = useState(false);
  const [isSectionFiveOpen, setIsSectionFiveOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const [message, setMessage] = useState(null);

  const topics = [
    {
      icon: "💃",
      title: "The Month's Vibe & Your Mantra",
      description: `The energetic tone for the month at a glance.`,
    },
    {
      icon: "🌟",
      title: "Your Calendar of Power & Prudence",
      description: `A practical, scannable guide to the month's key dates.`,
    },
    {
      icon: "📚",
      title: "Your Life-Area Playbook",
      description: `Advice for key areas of life from career to relationships.`,
    },
    {
      icon: "🎯",
      title: "The Month Challenge",
      description: `A simple challenge for you this month.`,
    },
    {
      icon: "✨",
      title: "The Month's Guiding Wisdom",
      description: `A beautiful, reflective conclusion of the reading.`,
    },
  ];

  const javaneseDate = reading?.created_at
    ? getJavaneseDate(format(new Date(reading?.created_at), "yyyy-MM-dd"))
    : "";

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

  const handleMonthlyReading = async () => {
    setError(null);
    setMessage(null);
    setRequestMonthlyReading(true);

    // Check if today's reading already exists for the user
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      // Check if monthly reading already exists for current month
      const { data: existingReadings, error: fetchError } = await supabase
        .from("readings")
        .select("reading, created_at, status, id")
        .eq("user_id", user.id)
        .gte("created_at", firstDayOfMonth.toISOString())
        .lt("created_at", lastDayOfMonth.toISOString())
        .eq("reading_category", "monthly")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingReadings && existingReadings.length > 0) {
        setReading(existingReadings[0]);
        setMessage("You already have a monthly reading for today.");
        setRequestMonthlyReading(false);
        return null;
      }

      if (requestMonthlyReading) return null;
      setRequestMonthlyReading(true);
    } catch (err) {
      console.error("Error checking today's reading:", err);
      setError("Failed to check today's reading.");
      setRequestMonthlyReading(false);
    }
  };

  useEffect(() => {
    if (profileData && user) {
      handleMonthlyReading();
    }
  }, [profileData]);

  //   console.log("Profile Data:", profileData);

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

  // console.log(profileData);

  return (
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
        {showTitleInNavbar && profileData && (
          <div className="navbar-center flex-col">
            <div className="text-xs text-batik-text font-semibold uppercase">
              Monthly Reading
            </div>
            <span className="text-batik-black font-semibold text-sm">
              {format(new Date(reading?.created_at), "MMMM yyyy")}
            </span>
          </div>
        )}
        <div className="navbar-end"></div>
      </div>

      {error && <ErrorLayout error={error} router={router} />}

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        {reading?.status === "completed" &&
        profileData?.subscription == "pro" ? (
          <div className={"space-y-6"}>
            <div>
              <h2 className="text-xl font-semibold">🌙 Monthly Reading</h2>
              <div className="font-medium">
                <span className="">
                  {format(new Date(reading?.created_at), "MMMM")}
                </span>{" "}
                - Month of {javaneseDate?.monthName}, Year of{" "}
                {javaneseDate?.yearName}
              </div>
              {/* <div className="text-slate-600 mt-3">
                <div className="text-base text-batik-text font-semibold">
                  This Month Auspiciousness
                </div>
                <div
                  className={clsx(
                    "text-2xl font-bold",
                    reading?.reading?.summary?.auspicious_scale < 2
                      ? "text-rose-500"
                      : reading?.reading?.summary?.auspicious_scale < 3
                      ? "text-amber-500"
                      : "text-green-600"
                  )}
                >
                  {reading?.reading?.summary?.auspicious_scale}
                  <span className="text-base font-light text-slate-800">
                    /5
                  </span>
                </div>
                <div className="text-base text-slate-800 font-light">
                  {reading?.reading?.summary?.auspicious_description}
                </div>
              </div> */}
            </div>
            <section className="border-batik-text/20 space-y-4">
              <h2 className="text-xl font-semibold text-left">
                {reading?.reading?.summary?.core_theme}
              </h2>
              <div className="flex flex-col gap-4">
                <div className="text-slate-600">
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.summary?.description?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="border-t border-batik-text/20 pt-4 space-y-4">
              <h2 className="text-xl font-semibold text-left">
                🤩 How it Will Affecting You
              </h2>
              <div className="flex flex-col gap-4">
                <div className="text-slate-600">
                  <div className="text-base text-batik-text font-semibold">
                    Auspicious Times this Month
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.analysis?.power_days?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
                <div className="text-slate-600">
                  <div className="text-base text-batik-text font-semibold">
                    Windows for Caution
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.analysis?.cautious_windows?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
                <div className="text-slate-600">
                  <div className="text-base text-batik-text font-semibold">
                    How the Month's Energy Affects You
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.analysis?.effect?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="border-t border-batik-text/20 pt-4 space-y-4">
              <h2 className="text-xl font-semibold text-left">
                🤔 Insight and Guidance for You
              </h2>
              <div className="flex flex-col gap-4">
                <div className="text-slate-600">
                  <div className="text-base text-batik-text font-semibold">
                    Personal Growth and Self Development
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.guidance?.growth?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
                <div className="text-slate-600">
                  <div className="text-base text-batik-text font-semibold">
                    Relationships (Love, Family, Social)
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.guidance?.relationship?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
                <div className="text-slate-600">
                  <div className="text-base text-batik-text font-semibold">
                    Career & Financial
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.guidance?.career?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
                <div className="text-slate-600">
                  <div className="text-base text-batik-text font-semibold">
                    Health & Well-being
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.guidance?.health?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
                <div className="text-slate-600">
                  <div className="text-base text-batik-text font-semibold">
                    Spirituality
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.guidance?.spiritual?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="border border-slate-200 bg-batik-light shadow p-4 space-y-4 rounded-2xl mt-4">
              <h2 className="text-xl font-semibold text-left">
                🎯 Your Monthly Challenge
              </h2>
              <div className="flex flex-col gap-4">
                <div className="text-slate-600">
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.guidance?.month_challenge?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="pt-4 space-y-4">
              <h2 className="text-xl font-semibold text-left">
                ✨ The Month's Guiding Wisdom
              </h2>
              <div className="flex flex-col gap-4">
                <div className="text-slate-600">
                  <div className="overflow-hidden">
                    <div className="flex flex-col">
                      <Markdown className="text-gray-700">
                        {reading?.reading?.wisdom?.philosophy?.replace(
                          /—/gi,
                          ", "
                        )}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : reading?.status === "pending" ? (
          <ReadingLoading />
        ) : (
          profileData?.subscription == "free" && (
            <div className="bg-gradient-to-t from-white from-10% via-white via-80% to-white/60 to-90% w-full bottom-0 flex flex-col items-center">
              <div className="flex flex-col gap-3 pb-10">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-semibold text-left">
                    🌙 Monthly Reading
                  </h2>
                  Navigate the month ahead with a personal cosmic roadmap that
                  translates its core energy and key dates into your practical
                  playbook for success.
                </div>
                <div className="flex flex-col gap-3 py-4">
                  <div className="text-lg font-semibold">Topics</div>
                  <div className="flex flex-col gap-3">
                    {topics?.map((topic, i) => (
                      <div key={i} className="flex flex-row gap-4 items-center">
                        <div className="text-3xl">{topic?.icon}</div>
                        <div className="flex flex-col">
                          <div className="font-semibold text-sm">
                            {topic?.title}
                          </div>
                          <div className="text-sm text-slate-600">
                            {topic?.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
        {reading?.id && profileData?.subscription == "pro" && (
          <div>
            <FeedbackSession user={user} reading={reading} />
          </div>
        )}
      </main>
      {profileData?.subscription == "free" && (
        <div className="fixed bottom-0 w-full p-2 pb-10 bg-base-100 border-batik-border shadow-[0px_-4px_12px_0px_rgba(0,_0,_0,_0.1)]">
          <button
            className="btn bg-amber-600 font-semibold text-white rounded-xl w-full"
            onClick={() => {}}
          >
            🔓 Unlock With Pro
          </button>
        </div>
      )}
    </div>
  );
}
