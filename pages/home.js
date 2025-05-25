// pages/dashboard.jsx
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

import Link from "next/link";
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";
import { format } from "date-fns";
import { Menubar } from "@/components/layouts/menubar";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [requestingReading, setRequestingReading] = useState(false);
  const [fortuneResult, setFortuneResult] = useState(null);
  const [currentReadings, setCurrentReadings] = useState(0);
  const [latestReadings, setLatestReadings] = useState([]);

  // console.log(user, authLoading);

  const READING_LIMIT = 2;

  const todayReading = {
    // Using an ISO string for easier parsing and formatting
    date: "2025-05-17T00:00:00.000Z",
    today:
      "Hey, today could be a cool mix of chilling out with your own thoughts and connecting with your friends or crew.",
    do: "Maybe take some time for yourself to recharge, but also don't miss out on good vibes with people around you.",
    dont: "Try not to get too lost in your head or be too hard on yourself today.",
  };

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
        .select("id, full_name")
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
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setLatestReadings(data);
    } catch (err) {
      console.error("Error fetching latest readings:", err);
      setError("Failed to load latest readings.");
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      checkProfile();
      fetchLatestReadings();
    } else {
      router.push("/");
    }
  }, [user, authLoading]);

  const handleLogout = async () => {
    console.log("user", user);
    await logout();
    // router.push("/");
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Loading user data...</p>
      </div>
    );
  }

  const renderTodayReading = () => {
    if (!todayReading) return null; // Or some placeholder if it might be null

    let formattedDate = "Date unavailable";
    try {
      // Example format: "May 17, 2025"
      formattedDate = format(new Date(todayReading.date), "MMMM d");
    } catch (e) {
      console.error("Error formatting todayReading.date:", e);
      // Keep 'Date unavailable' or use todayReading.date as fallback
    }
    return (
      <div className="card bg-base-100 border border-[var(--color-batik-border)]">
        <div className="card-body p-4">
          <p className="text-sm font-semibold text-base-content/80">
            {formattedDate}
          </p>
          <p className="mt-2 text-base-content">{todayReading.today}</p>
          {todayReading.do && (
            <div className="mt-3">
              <p className="font-semibold text-green-700 dark:text-green-500">
                Do:
              </p>
              <p className="text-sm text-base-content/90">{todayReading.do}</p>
            </div>
          )}
          {todayReading.dont && (
            <div className="mt-2">
              <p className="font-semibold text-red-700 dark:text-red-500">
                Don&apos;t:
              </p>
              <p className="text-sm text-base-content/90">
                {todayReading.dont}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLatestReadings = () => {
    console.log(latestReadings);
    return (
      <ul className="flex flex-row flex-nowrap overflow-x-auto">
        {latestReadings.map((r) => (
          <li key={r.id} className="w-fit">
            <Link href={`/readings/${r?.reading_category}/${r.slug}`}>
              <div className="rounded-2xl flex flex-col gap-2 p-4 bg-base-100 ml-4 shadow-sm border border-[var(--color-batik-border)] h-[8rem] w-[10rem]">
                <p className="text-base-content font-semibold">{r.title}</p>{" "}
                <div className="text-xs text-base-content/80">{r.subtitle}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  console.log(profileData);

  return (
    <div className="h-[100svh] flex flex-col bg-base relative">
      <DashboardNavbar user={user} handleLogout={handleLogout} />
      <div className="py-4 sm:py-6 flex-grow my-12">
        <div className="px-4 pb-2">
          <p className="text-lg sm:text-xl font-semibold text-batik-black">
            Good {getTimeOfDay()},{" "}
            {profileData.full_name?.split(" ")[0] || "User"}!
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="px-4">{renderTodayReading()}</div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="px-4 text-lg font-medium text-batik-black">
            Latest readings
          </div>
          <div className="">{renderLatestReadings()}</div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="px-4 text-lg font-medium text-batik-black">
            Compatibility Reading
          </div>
          <div className="p-4 rounded-2xl text-batik-black">
            <div></div>
            <div></div>
          </div>
        </div>
        <Menubar page={"home"} />
      </div>
    </div>
  );
}
