// pages/dashboard.jsx
import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { config } from "@/utils/config";
import { ArrowRight } from "lucide-react";

import Link from "next/link";
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";
import { format } from "date-fns";
import { Menubar } from "@/components/layouts/menubar";
import { getWeton } from "@/utils";
import { closeBrowser } from "@/utils/native-browser";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [dailyReading, setDailyReading] = useState([]);
  const [monthlyReading, setMonthlyReading] = useState([]);
  const [requestDailyReading, setRequestDailyReading] = useState(false);
  const [requestMonthlyReading, setRequestMonthlyReading] = useState(false);
  const [requestingReading, setRequestingReading] = useState(false);
  const [fortuneResult, setFortuneResult] = useState(null);
  const [currentReadings, setCurrentReadings] = useState(0);
  const [latestReadings, setLatestReadings] = useState([]);

  // console.log(user, authLoading);

  const READING_LIMIT = 2;

  const getTimeOfDay = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "afternoon";
    } else if (currentHour >= 18 && currentHour < 22) {
      return "evening";
    } else {
      return "night";
    }
  };

  const checkProfile = async () => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "weton, id, full_name, weton, gender, username, wuku, birth_date"
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
        .neq("reading_category", "compatibility")
        .neq("reading_category", "daily")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setLatestReadings(data);
    } catch (err) {
      console.error("Error fetching latest readings:", err);
      setError("Failed to load latest readings.");
    }
  };

  const handleDailyReading = async () => {
    setError(null);
    setMessage(null);
    setRequestDailyReading(true);

    // Check if today's reading already exists for the user
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Check if today's daily reading already exists
      const { data: existingReadings, error: fetchError } = await supabase
        .from("readings")
        .select("reading, created_at, status")
        .eq("user_id", user.id)
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString())
        .eq("reading_category", "daily")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingReadings && existingReadings.length > 0) {
        setDailyReading(existingReadings[0]);
        setMessage("You already have a daily reading for today.");
        setRequestDailyReading(false);
        return null;
      }

      if (requestDailyReading) return null;
      setRequestDailyReading(true);

      console.log("generate new daily reading");
      let readingData;

      try {
        const response = await fetch(`${config.api.url}/readings/daily`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profile: profileData }),
          credentials: "include",
        });

        readingData = await response.json(); // Always try to parse JSON
      } catch (err) {
        console.error(
          "Error in fetch or processing response for daily reading:",
          err
        );
        setError(err.message || "Failed to generate daily reading.");
      } finally {
        setRequestDailyReading(false);
      }
    } catch (err) {
      console.error("Error checking today's reading:", err);
      setError("Failed to check today's reading.");
      setRequestDailyReading(false);
    }
  };

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
        .select("reading, created_at, status, reading_category, slug")
        .eq("user_id", user.id)
        .gte("created_at", firstDayOfMonth.toISOString())
        .lt("created_at", lastDayOfMonth.toISOString())
        .eq("reading_category", "monthly")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingReadings && existingReadings.length > 0) {
        setMonthlyReading(existingReadings[0]);
        setMessage("You already have a monthly reading for today.");
        setRequestMonthlyReading(false);
        return null;
      }

      if (requestMonthlyReading) return null;
      setRequestMonthlyReading(true);

      console.log("generate new monthly reading");
      let readingData;

      try {
        const response = await fetch(`${config.api.url}/readings/monthly`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profile: profileData }),
          credentials: "include",
        });

        readingData = await response.json(); // Always try to parse JSON
      } catch (err) {
        console.error(
          "Error in fetch or processing response for daily reading:",
          err
        );
        setError(err.message || "Failed to generate daily reading.");
      } finally {
        setRequestMonthlyReading(false);
      }
    } catch (err) {
      console.error("Error checking today's reading:", err);
      setError("Failed to check today's reading.");
      setRequestMonthlyReading(false);
    }
  };

  // useEffect(() => {
  //   if (profileData && user) {
  //     closeBrowser().catch(() => {});
  //   }
  // }, []);

  // Effect for fetching initial user-dependent data
  useEffect(() => {
    if (!authLoading && user) {
      checkProfile();
      fetchLatestReadings();
    } else if (!authLoading && !user) {
      // Ensure we don't redirect during initial authLoading
      router.push("/");
    }
  }, [user, authLoading, router]); // Added router to dependencies

  // Effect to handle daily reading once profileData is available
  useEffect(() => {
    if (profileData && user) {
      closeBrowser().catch(() => {});
      // Only run if profileData and user exist
      handleMonthlyReading();
      handleDailyReading();
    }
  }, [profileData]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("daily_reading_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "readings",
          filter: {
            user_id: `eq.${user?.id}`,
            reading_category: "eq.daily",
          },
        },
        (payload) => {
          console.log("payload", payload);
          setDailyReading(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch();
    };
  }, [user]);

  const handleLogout = async () => {
    console.log("user", user);
    await logout();
    // router.push("/");
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg text-batik-text"></span>
        <p className="mt-4">Loading user data...</p>
      </div>
    );
  }

  const renderTodayReading = () => {
    if (!dailyReading) return null;
    const reading = dailyReading?.reading;

    let formattedDate = "Date unavailable";
    try {
      formattedDate = dailyReading?.created_at
        ? format(new Date(dailyReading?.created_at), "MMMM d")
        : "";
    } catch (e) {
      console.error("Error formatting todayReading.date:", e);
    }
    if (dailyReading?.status === "loading") {
      return (
        <div className="card bg-base-100 border border-[var(--color-batik-border)]">
          <div className="card-body p-4 flex items-center justify-center">
            <span className="loading loading-spinner loading-md"></span>
            <p className="ml-2">Generating your daily reading...</p>
          </div>
        </div>
      );
    }

    if (dailyReading?.status === "completed") {
      return (
        <div className="card bg-base-100 border border-[var(--color-batik-border)]">
          <div className="card-body p-4">
            <p className="text-sm font-semibold">
              {formattedDate} ({reading?.weton})
            </p>
            <p className="mt-2 text-base-content">{reading?.today}</p>
            {/* {reading?.do && (
              <div className="mt-3">
                <p className="font-semibold ">Do:</p>
                <p className="text-sm text-base-content/90">{reading?.do}</p>
              </div>
            )}
            {reading?.dont && (
              <div className="mt-2">
                <p className="font-semibold ">Don&apos;t:</p>
                <p className="text-sm text-base-content/90">{reading?.dont}</p>
              </div>
            )}
            {reading?.fact && (
              <div className="mt-2">
                <p className="text-xs italic text-base-content/90">
                  {reading?.fact}
                </p>
              </div>
            )} */}
          </div>
        </div>
      );
    }
  };

  const renderLatestReadings = () => {
    return (
      <ul className="flex flex-row flex-nowrap overflow-x-scroll overflow-y-hidden">
        {latestReadings.map((r) => (
          <li key={r.id} className="w-fit ml-4 last:mr-4">
            <Link href={`/readings/${r?.reading_category}/${r.slug}`}>
              <div className="rounded-2xl flex flex-col gap-2 p-4 bg-base-100   shadow-sm border border-[var(--color-batik-border)] h-[8rem] w-[10rem]">
                <p className="text-base-content font-semibold text-sm">
                  {r.title}
                </p>{" "}
                <div className="text-xs text-base-content/80 text-balance truncate">
                  {r.subtitle}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  const renderMonthlyReading = () => {
    if (!monthlyReading) return null;
    const reading = monthlyReading?.reading;

    let formattedDate = "Date unavailable";

    try {
      formattedDate = monthlyReading?.created_at
        ? format(new Date(monthlyReading?.created_at), "MMMM")
        : "";
    } catch (e) {
      console.error("Error formatting monthlyReading.date:", e);
    }

    if (monthlyReading?.status === "loading") {
      return (
        <div className="card bg-base-100 border border-[var(--color-batik-border)]">
          <div className="card-body p-4 flex items-center justify-center">
            <span className="loading loading-spinner loading-md"></span>
            <p className="ml-2">Generating your monthly reading...</p>
          </div>
        </div>
      );
    }

    if (monthlyReading?.status === "completed") {
      return (
        <div className="card bg-base-100 border border-[var(--color-batik-border)]">
          <div className="card-body p-4">
            <p className="text-lg font-semibold text-center">
              Monthly Reading - {formattedDate}
            </p>
            <p className="font-semibold text-center">
              {reading?.summary?.core_theme}
            </p>
            <p className="text-sm text-base-content">
              {reading?.summary?.description}
            </p>
            <Link
              className="text-batik-text font-semibold inline-flex items-center"
              href={`/readings/${monthlyReading?.reading_category}/${monthlyReading?.slug}`}
            >
              Read More
              <ArrowRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
        </div>
      );
    }
  };

  // const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // const todayWeton = getWeton(format(new Date(), "yyyy-MM-dd"))?.weton_en;
  // const localDate = utcToZonedTime(new Date(), deviceTimeZone);

  // console.log(deviceTimeZone, new Date(), todayWeton);

  // console.log(dailyReading);

  console.log(user);

  return (
    <div className="h-[100svh] flex flex-col bg-base relative">
      <DashboardNavbar user={user} />
      <div className="py-4 pb-20 overflow-y-auto flex-grow mt-12 mb-8">
        <div className="px-4">
          <p className="text-lg sm:text-xl font-semibold text-batik-black">
            Good {getTimeOfDay()},{" "}
            {profileData?.full_name?.split(" ")[0] || "User"}!
          </p>
        </div>
        {/* <Link href={"/intro"}>See Intro</Link> */}
        <div className="flex flex-col gap-2 p-4">
          <div className="">{renderTodayReading()}</div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="">{renderMonthlyReading()}</div>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <div className="card bg-base-100 border border-[var(--color-batik-border)]">
            <div className="flex flex-col gap-2 p-4">
              <div className="text-lg font-semibold">
                The Heart&apos;s True Compass
              </div>
              <div>
                Some connections feel like destiny. Javanese wisdom offers a
                unique key to unlock the secrets of your union.
              </div>
              <Link
                href={"/compatibility"}
                className="btn border-batik-border text-batik-text rounded-2xl"
              >
                Reveal Your Compatibility
              </Link>
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <div className="card bg-base-100 border border-[var(--color-batik-border)]">
            <div className="flex flex-col gap-2 p-4">
              <div className="text-lg font-semibold">
                Understand Your Connections
              </div>
              <div>
                Discover the unique Weton and Wuku blueprint of your friends to
                foster deeper understanding and stronger bonds
              </div>
              <Link
                className="btn border-batik-border text-batik-text rounded-2xl"
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

        {/* <div className="mt-4 flex flex-col gap-2">
          <div className="px-4 text-lg font-medium text-batik-black">
            Compatibility Reading
          </div>
          <div className="p-4 rounded-2xl text-batik-black">
            <div></div>
            <div></div>
          </div>
        </div> */}
        <Menubar page={"home"} />
      </div>
    </div>
  );
}
