// pages/dashboard.jsx
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";
import { Menubar } from "@/components/layouts/menubar";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [requestingReading, setRequestingReading] = useState(false);
  const [fortuneResult, setFortuneResult] = useState(null);
  const [currentReadings, setCurrentReadings] = useState(0);
  const [latestReadings, setLatestReadings] = useState([]);

  // console.log(user, authLoading);

  const READING_LIMIT = 2;

  //user auth
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
    // If auth is still loading from AuthContext, wait.
    if (authLoading) {
      console.log("Home useEffect: Auth loading, waiting...");
      setLoadingData(true); // Show data loading indicator
      return;
    }

    // If auth is done, but there's no user, redirect to login.
    if (!user) {
      console.log(
        "Home useEffect: No user found after auth load, redirecting."
      );
      router.push("/");
      return; // Stop execution
    }

    // Auth loaded and user exists, proceed to load page data.
    console.log("Home useEffect: User found, loading page data...");
    const loadPageData = async () => {
      setLoadingData(true);
      setError(null);
      try {
        // Check profile first - might redirect
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username") // Fetch count if needed
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError; // Let catch block handle

        if (!profile) {
          console.log(
            "Home useEffect: Profile not found, redirecting to setup."
          );
          router.push("/profile-setup");
          return; // Stop if redirecting
        }
      } catch (err) {
        console.error("Error loading initial page data:", err);
        setError("Failed to load page data. Please try again.");
        // Potentially redirect on critical errors, or just show message
      } finally {
        // Only set loading false if we haven't redirected
        if (router.pathname === "/home") {
          setLoadingData(false);
        }
      }
    };

    loadPageData(); // Call the async function
  }, [user, authLoading, router]);

  const checkProfile = async () => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error("Error fetching profile:", profileError);
        router.push("/profile-setup");
      }
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
    }
  }, [user, authLoading]);

  const handleLogout = async () => {
    console.log("user", user);
    await logout();
    // router.push("/");
  };

  if (loadingData || authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Loading user data...</p>
      </div>
    );
  }

  const renderReadings = () => {
    return (
      <ul className="space-y-4">
        {readings.map((reading) => (
          <li key={reading.id}>
            <div className="card bg-base-100 shadow-md">
              {" "}
              {/* Use theme's base background for cards */}
              <div className="card-body p-4">
                {" "}
                {/* Adjust padding as needed */}
                <Link
                  href={`/readings/basic/${reading.id}`}
                  className="hover:text-primary"
                >
                  <p className="text-sm text-base-content/80">
                    {" "}
                    {/* Use theme's content color with opacity */}
                    {new Date(reading.created_at).toLocaleDateString()}
                  </p>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderLatestReadings = () => {
    console.log(latestReadings);
    return (
      <ul className="space-y-4">
        {latestReadings.map((r) => (
          <li key={r.id} className="w-fit">
            <Link
              href={`/readings/${r?.reading_category}/${r.slug}`}
              className="hover:text-primary"
            >
              <div className="card bg-base-100 shadow-sm border border-[var(--color-batik-border)] h-20">
                {" "}
                {/* Keep custom border, use theme bg */}
                <div className="card-body p-4 flex items-center justify-center">
                  <p className="text-sm text-base-content font-semibold">
                    {r.title}
                  </p>{" "}
                  {/* Use theme's content color */}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-[100svh] flex flex-col bg-base-100 relative">
      <DashboardNavbar user={user} handleLogout={handleLogout} />
      <div className="py-4 sm:py-6 flex-grow my-12">
        <div className="flex flex-col gap-2">
          <div className="px-4 text-lg font-medium text-batik-black">
            Daily reading
          </div>
          <div className="px-4">{renderReadings()}</div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="px-4 text-lg font-medium text-batik-black">
            Latest readings
          </div>
          <div className="px-4">{renderLatestReadings()}</div>
        </div>
        <Menubar page={"home"} />
      </div>
    </div>
  );
}
