// pages/dashboard.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { config } from "@/utils/config";
import Link from "next/link";
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";
import { Menubar } from "@/components/layouts/menubar";
import { getDayInformation, getWeton, getCompatibilitySlug } from "@/utils";
import { closeBrowser } from "@/utils/native-browser";
import { DailyReadingSection } from "@/components/readings/daily-reading-section";
import { MonthlyReadingSection } from "@/components/readings/monthly-reading-section";
import { Toaster, toast } from "sonner";
import { SubscriptionBannerHome } from "@/components/subscriptions/subscription-banner-home";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { HomeLoadingSkeleton } from "@/components/layouts/home-loading-skeleton";
import { useDailyReading, useMonthlyReading } from "@/utils/useReading";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [latestReadings, setLatestReadings] = useState([]);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [showDailyReadingSheet, setShowDailyReadingSheet] = useState(false);
  const scrollContainerRef = useRef(null);
  const dailyReadingGenerated = useRef(false);
  const monthlyReadingGenerated = useRef(false);

  const {
    reading: dailyReading,
    error: dailyReadingError,
    isLoading: loadingDailyReading,
  } = useDailyReading(user?.id);

  const {
    reading: monthlyReading,
    error: monthlyReadingError,
    isLoading: loadingMonthlyReading,
  } = useMonthlyReading(user?.id);

  const getTimeOfDay = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good afternoon";
    } else if (currentHour >= 18 && currentHour < 22) {
      return "Good evening";
    } else {
      return "Good night";
    }
  };

  const generateReading = useCallback(
    async (category) => {
      if (!profileData) return;
      console.log(`Generating ${category} reading...`);
      try {
        await fetch(`${config.api.url}/readings/${category}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: profileData, today: new Date() }),
          credentials: "include",
        });
      } catch (err) {
        console.error(`Error generating ${category} reading:`, err);
        setError(`Failed to generate ${category} reading.`);
      }
    },
    [profileData]
  );

  const checkProfile = async () => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "weton, id, full_name, weton, gender, username, wuku, birth_date, subscription"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error("Error fetching profile:", profileError);
        router.push("/profile-setup");
      }
      setProfileData(profile);
    } catch (err) {
      console.error("Error checking profile:", err);
      setError("Failed to check profile.");
      setLoading(false);
    }
    setLoading(false);
  };

  const fetchLatestReadings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", user.id)
        // .neq("reading_category", "compatibility")
        .neq("reading_category", "daily")
        // .neq("reading_category", "monthly")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setLatestReadings(data);
    } catch (err) {
      console.error("Error fetching latest readings:", err);
      setError("Failed to load latest readings.");
    }
  };

  console.log(
    dailyReading,
    loadingDailyReading,
    profileData,
    dailyReadingGenerated.current
  );

  useEffect(() => {
    if (
      !loadingDailyReading &&
      !dailyReading &&
      profileData &&
      !dailyReadingGenerated.current
    ) {
      console.log("Generating daily reading...");
      dailyReadingGenerated.current = true;
      generateReading("daily");
    }
  }, [loadingDailyReading, dailyReading, profileData, generateReading]);

  useEffect(() => {
    if (
      !loadingMonthlyReading &&
      !monthlyReading &&
      profileData &&
      !monthlyReadingGenerated.current
    ) {
      monthlyReadingGenerated.current = true;
      generateReading("monthly");
    }
  }, [loadingMonthlyReading, monthlyReading, profileData, generateReading]);

  // const handleDailyReading = async () => {
  //   if (dailyReadingRequestedRef.current) return;
  //   dailyReadingRequestedRef.current = true;

  //   setError(null);
  //   setMessage(null);
  //   setRequestDailyReading(true);

  //   // Check if today's reading already exists for the user
  //   try {
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);
  //     const tomorrow = new Date(today);
  //     tomorrow.setDate(today.getDate() + 1);

  //     const { data: existingReadings, error: fetchError } = await supabase
  //       .from("readings")
  //       .select("reading, created_at, status")
  //       .eq("user_id", user.id)
  //       .gte("created_at", today.toISOString())
  //       .lt("created_at", tomorrow.toISOString())
  //       .eq("reading_category", "daily")
  //       .order("created_at", { ascending: false })
  //       .limit(1);

  //     if (fetchError) throw fetchError;

  //     if (existingReadings && existingReadings.length > 0) {
  //       setDailyReading(existingReadings[0]);
  //       setMessage("You already have a daily reading for today.");
  //       setRequestDailyReading(false);
  //       return null;
  //     }

  //     if (requestDailyReading) return null;
  //     setRequestDailyReading(true);

  //     console.log("generate new daily reading");
  //     let readingData;
  //     try {
  //       const response = await fetch(`${config.api.url}/readings/daily`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ profile: profileData, today: today }),
  //         credentials: "include",
  //       });

  //       readingData = await response.json(); // Always try to parse JSON
  //     } catch (err) {
  //       console.error(
  //         "Error in fetch or processing response for daily reading:",
  //         err
  //       );
  //       setError(err.message || "Failed to generate daily reading.");
  //     } finally {
  //       setRequestDailyReading(false);
  //     }
  //   } catch (err) {
  //     console.error("Error checking today's reading:", err);
  //     setError("Failed to check today's reading.");
  //     setRequestDailyReading(false);
  //   }
  // };

  // const handleMonthlyReading = async () => {
  //   setError(null);
  //   setMessage(null);
  //   setRequestMonthlyReading(true);

  //   // Check if today's reading already exists for the user
  //   try {
  //     const today = new Date();
  //     const firstDayOfMonth = new Date(
  //       today.getFullYear(),
  //       today.getMonth(),
  //       1
  //     );
  //     const lastDayOfMonth = new Date(
  //       today.getFullYear(),
  //       today.getMonth() + 1,
  //       0
  //     );

  //     // Check if monthly reading already exists for current month
  //     const { data: existingReadings, error: fetchError } = await supabase
  //       .from("readings")
  //       .select("reading, created_at, status, reading_category, slug")
  //       .eq("user_id", user.id)
  //       .gte("created_at", firstDayOfMonth.toISOString())
  //       .lt("created_at", lastDayOfMonth.toISOString())
  //       .eq("reading_category", "monthly")
  //       .order("created_at", { ascending: false })
  //       .limit(1);

  //     if (fetchError) throw fetchError;

  //     if (existingReadings && existingReadings.length > 0) {
  //       setMonthlyReading(existingReadings[0]);
  //       setMessage("You already have a monthly reading for today.");
  //       setRequestMonthlyReading(false);
  //       return null;
  //     }

  //     if (requestMonthlyReading) return null;
  //     setRequestMonthlyReading(true);

  //     console.log("generate new monthly reading");
  //     let readingData;

  //     try {
  //       const response = await fetch(`${config.api.url}/readings/monthly`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ profile: profileData, today: today }),
  //         credentials: "include",
  //       });

  //       readingData = await response.json(); // Always try to parse JSON
  //     } catch (err) {
  //       console.error(
  //         "Error in fetch or processing response for daily reading:",
  //         err
  //       );
  //       setError(err.message || "Failed to generate daily reading.");
  //     } finally {
  //       setRequestMonthlyReading(false);
  //     }
  //   } catch (err) {
  //     console.error("Error checking today's reading:", err);
  //     setError("Failed to check today's reading.");
  //     setRequestMonthlyReading(false);
  //   }
  // };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/");
      } else {
        checkProfile();
        fetchLatestReadings();
      }
    }
  }, [user, authLoading, router]);

  // Effect to handle daily reading once profileData is available
  // useEffect(() => {
  //   if (profileData && user && !dailyReadingRequestedRef.current) {
  //     // handleMonthlyReading();
  //     handleDailyReading();
  //   }
  // }, [profileData, user]);

  // useEffect(() => {
  //   if (!user) return;

  //   const channel = supabase
  //     .channel("daily_reading_changes")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "UPDATE",
  //         schema: "public",
  //         table: "readings",
  //         filter: {
  //           user_id: `eq.${user?.id}`,
  //           reading_category: "eq.daily",
  //         },
  //       },
  //       (payload) => {
  //         console.log("payload", payload);
  //         setDailyReading(payload.new);
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel).catch();
  //   };
  // }, [user]);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    setShowTitleInNavbar(scrollPosition > 40);
  };

  useEffect(() => {
    if (showDailyReadingSheet) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showDailyReadingSheet]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // if (authLoading || (loading && !error)) {
  //   return <PageLoadingLayout />;
  // }

  if (!profileData && !loading) {
    return (
      <NoProfileLayout
        router={router}
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />
    );
  }

  const renderLatestReadings = () => {
    return (
      <ul className="flex flex-row flex-nowrap overflow-x-scroll overflow-y-hidden pb-3">
        {latestReadings?.map((r) => {
          const compatibilitySlug = getCompatibilitySlug(r.slug);
          if (r?.reading_category === "compatibility") {
            return (
              <li key={r.id} className="w-fit ml-4 last:mr-4 ">
                <Link
                  href={`/readings/${r?.reading_category}/${compatibilitySlug}?slug=${r.slug}`}
                >
                  <div className="rounded-2xl flex flex-col gap-2 p-4 bg-base-100 active:bg-batik focus:bg-batik shadow-md border border-[var(--color-batik-border)] h-[8rem] w-[10rem]">
                    <p className="line-clamp-2 text-base-content font-semibold text-sm ">
                      {r.title}
                    </p>{" "}
                    <div className="text-xs text-base-content/80 text-balance line-clamp-3">
                      {r.subtitle}
                    </div>
                  </div>
                </Link>
              </li>
            );
          } else
            return (
              <li key={r.id} className="w-fit ml-4 last:mr-4 ">
                <Link href={`/readings/${r?.reading_category}/${r.slug}`}>
                  <div className="rounded-2xl flex flex-col gap-2 p-4 bg-base-100 active:bg-batik focus:bg-batik shadow-md border border-[var(--color-batik-border)] h-[8rem] w-[10rem]">
                    <p className="line-clamp-2 text-base-content font-semibold text-sm">
                      {r.title}
                    </p>{" "}
                    <div className="text-xs text-base-content/80 text-balance line-clamp-3">
                      {r.subtitle}
                    </div>
                  </div>
                </Link>
              </li>
            );
        })}
      </ul>
    );
  };

  // console.log(profileData);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-batik to-base-100 to-85%">
      <Toaster richColors />
      <DashboardNavbar user={user} showTitleInNavbar={showTitleInNavbar} />
      <div className="py-5 pb-20 overflow-y-auto flex-grow mb-8">
        <div className="px-4">
          <p className="text-2xl font-semibold text-batik-black">
            {getTimeOfDay()} {profileData?.full_name?.split(" ")[0]}! 👋
          </p>
        </div>
        {authLoading || (loading && !error) ? (
          <HomeLoadingSkeleton />
        ) : (
          <div>
            <div className="flex flex-col gap-2 p-4">
              <DailyReadingSection
                dailyReading={dailyReading}
                setShowDailyReadingSheet={setShowDailyReadingSheet}
                showDailyReadingSheet={showDailyReadingSheet}
                loadingDailyReading={loadingDailyReading}
              />
            </div>
            {profileData?.subscription == "free" && <SubscriptionBannerHome />}
            <div className="flex flex-col gap-2 p-4">
              <MonthlyReadingSection monthlyReading={monthlyReading} />
            </div>
            <div className="p-4 flex flex-col gap-2">
              <div className="card bg-base-100 border border-slate-200 bg-gradient-to-br from-rose-500 via-rose-400 to-rose-500 relative overflow-hidden shadow-md">
                <div className="flex flex-col gap-2 p-4">
                  <div className="text-xl text-white font-semibold">
                    💞 The Heart&apos;s True Compass
                  </div>
                  <div className="text-white mb-3">
                    Some connections feel like destiny. Javanese wisdom offers a
                    unique key to unlock the secrets of your union.
                  </div>
                  <Link
                    href={"/compatibility"}
                    className="btn bg-white text-rose-500 font-semibold rounded-2xl"
                  >
                    Reveal Your Compatibility
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <div className="card bg-base-100 border border-[var(--color-batik-border)] shadow-md">
                <div className="flex flex-col gap-2 p-4">
                  <div className="text-xl font-semibold">
                    🤝 Understand Your Connections
                  </div>
                  <div className="text-slate-700 mb-3">
                    Discover the unique Weton and Wuku blueprint of your friends
                    to foster deeper understanding and stronger bonds
                  </div>
                  <Link
                    className="btn border-batik-border text-batik-text font-semibold rounded-2xl"
                    href={`/connections`}
                  >
                    Add Your Friends
                  </Link>
                </div>
              </div>
            </div>
            <div className="my-4 flex flex-col gap-2">
              <div className="px-4 text-lg font-semibold text-batik-black">
                Latest Readings
              </div>
              <div className="overflow-x-auto overflow-y-clip">
                {renderLatestReadings()}
              </div>
            </div>
          </div>
        )}
        <Menubar page={"home"} />
      </div>
    </div>
  );
}
