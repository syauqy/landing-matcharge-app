import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function MonthlyReadingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [monthlyReading, setMonthlyReading] = useState([]);
  const [requestMonthlyReading, setRequestMonthlyReading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Or your app's login page
      return;
    }

    if (!router.isReady || !user) {
      setLoading(true);
      return;
    }

    const fetchProfileData = async () => {
      if (!user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch the user's profile data from the 'profiles' table
        const { data: userProfile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("weton, dina_pasaran") // Fetching the objects and dina_pasaran string
          .eq("id", user.id) // 'id' in profiles table is the user_id
          .single(); // Assuming one profile per user
        if (profileFetchError) throw profileFetchError;
        if (!userProfile) throw new Error("User profile data not found.");
        const safeProfileData = {
          dina_pasaran: userProfile.dina_pasaran || "N/A",
          weton: userProfile.weton || {},
        };
        setProfileData(safeProfileData);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(
          err.message || "Failed to load profile details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
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
        .select("reading, created_at, status")
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
    } catch (err) {
      console.error("Error checking today's reading:", err);
      setError("Failed to check today's reading.");
      setRequestMonthlyReading(false);
    }
  };

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
      handleMonthlyReading();
    }
  }, [profileData]);

  //   console.log("Profile Data:", profileData);

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg text-batik-text"></span>
        <p className="mt-4">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content p-4">
        <div className="alert alert-error shadow-lg max-w-md">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Error! {error}</span>
          </div>
        </div>
        <button onClick={() => router.back()} className="btn btn-neutral mt-6">
          Go Back
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content p-4">
        <div className="alert alert-warning shadow-lg max-w-md">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Could not load profile data. It might be incomplete or missing.
            </span>
          </div>
        </div>
        <button onClick={() => router.back()} className="btn btn-neutral mt-6">
          Go Back
        </button>
      </div>
    );
  }

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
              {format(new Date(monthlyReading?.created_at), "MMMM yyyy")}
            </span>
          </div>
        )}
        <div className="navbar-end"></div>
      </div>

      {monthlyReading?.status === "loading" && (
        <div className="card bg-base-100 border border-[var(--color-batik-border)]">
          <div className="card-body p-4 flex items-center justify-center">
            <span className="loading loading-spinner loading-md"></span>
            <p className="ml-2">Generating your monthly reading...</p>
          </div>
        </div>
      )}

      {monthlyReading?.status === "completed" && (
        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <div>
            <h2 className="text-xl font-semibold text-left">
              Monthly Reading -{" "}
              {format(new Date(monthlyReading?.created_at), "MMMM")}
            </h2>
            <div className="text-gray-800 mb-2 font-medium leading-5">
              {monthlyReading?.reading?.summary?.core_theme}
            </div>
            <p className="text-sm text-gray-800">
              {monthlyReading?.reading?.summary?.description}
            </p>
            <div className="text-slate-600 mt-3">
              <div className="text-sm text-batik-text font-semibold">
                Auspicious Scale
              </div>
              <div className="text-sm text-gray-800">
                {monthlyReading?.reading?.summary?.auspicious_scale}
              </div>
            </div>
          </div>
          <section className="border-t border-batik-text/20 pt-4">
            <h2 className="text-xl font-semibold text-left">
              How it Will Affecting You
            </h2>
            <div className="flex flex-col gap-4">
              <div className="text-slate-600">
                <div className="text-sm text-batik-text font-semibold">
                  Auspicious Times this Month
                </div>
                <div className="text-sm text-gray-800">
                  {monthlyReading?.reading?.analysis?.fortunate_windows}
                </div>
              </div>
              <div className="text-slate-600">
                <div className="text-sm text-batik-text font-semibold">
                  Times for You to be Cautious
                </div>
                <div className="text-sm text-gray-800">
                  {monthlyReading?.reading?.analysis?.cautious_windows}
                </div>
              </div>
            </div>
          </section>
          <section className="border-t border-batik-text/20 pt-4">
            <h2 className="text-xl font-semibold text-left">
              Insight and Guidance for You
            </h2>
            <div className="flex flex-col gap-4">
              <div className="text-slate-600">
                <div className="text-sm text-batik-text font-semibold">
                  Personal Growth and Self Development
                </div>
                <div className="text-sm text-gray-800">
                  {monthlyReading?.reading?.guidance?.growth}
                </div>
              </div>
              <div className="text-slate-600">
                <div className="text-sm text-batik-text font-semibold">
                  Relationships (Love, Family, Social)
                </div>
                <div className="text-sm text-gray-800">
                  {monthlyReading?.reading?.guidance?.relationship}
                </div>
              </div>
              <div className="text-slate-600">
                <div className="text-sm text-batik-text font-semibold">
                  Career & Financial
                </div>
                <div className="text-sm text-gray-800">
                  {monthlyReading?.reading?.guidance?.career}
                </div>
              </div>
              <div className="text-slate-600">
                <div className="text-sm text-batik-text font-semibold">
                  Health & Well-being
                </div>
                <div className="text-sm text-gray-800">
                  {monthlyReading?.reading?.guidance?.health}
                </div>
              </div>
            </div>
          </section>
          <section className="border-t border-batik-text/20 pt-4">
            <div className="text-sm text-gray-800 italic">
              {monthlyReading?.reading?.wisdom?.philosophy}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
