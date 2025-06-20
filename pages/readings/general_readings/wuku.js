import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BasicReadingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);

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
          .select("wuku") // Fetching the objects and dina_pasaran string
          .eq("id", user.id) // 'id' in profiles table is the user_id
          .single(); // Assuming one profile per user
        if (profileFetchError) throw profileFetchError;
        if (!userProfile) throw new Error("User profile data not found.");
        const safeProfileData = {
          wuku: userProfile.wuku || {},
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

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    setShowTitleInNavbar(scrollPosition > 80);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  console.log("Profile Data:", profileData);

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg"></span>
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
              Wuku
            </div>
            <span className="text-batik-black font-semibold text-sm">
              {profileData?.wuku?.name}
            </span>
          </div>
        )}
        <div className="navbar-end"></div>
      </div>

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <h1 className="text-xl font-semibold text-left">
            Wuku: The Essence of Your Being
          </h1>
          <p className="text-[10px] text-gray-700 mb-2">
            Your Wuku is the specific week within the 210-day Javanese Pawukon
            calendar into which you were born. It imprints you with unique
            characteristics, symbolic guardians, and overarching life patterns.
          </p>
        </div>
        <section>
          <div className="flex flex-col gap-4">
            <div className="text-slate-600">
              <div className="text-sm text-batik-text font-semibold">Wuku</div>
              <span className="text-batik-black font-semibold">
                {profileData?.wuku?.name}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="text-sm text-gray-700">
                {profileData?.wuku?.character}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-batik-text">
                Guardian Deity
              </div>
              <p className="text-[10px] text-gray-700 italic">
                The Deity associated with your Wuku is a divine patron,
                bestowing specific spiritual qualities, protection, and
                influencing your higher aspirations.
              </p>
              <div className="font-semibold">{profileData?.wuku?.god}</div>
              <div className="text-sm text-gray-700">
                {profileData?.wuku?.god_meaning}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-batik-text">Tree</div>
              <p className="text-[10px] text-gray-700 italic">
                The Tree of your Wuku symbolizes your connection to nature, your
                path of growth, inherent virtues, and the kind of environment
                where you best flourish.
              </p>
              <div className="font-semibold">{profileData?.wuku?.tree}</div>
              <div className="text-sm text-gray-700">
                {profileData?.wuku?.tree_meaning}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-batik-text">Bird</div>
              <p className="text-[10px] text-gray-700 italic">
                The Bird of your Wuku represents your ambitions, how you express
                yourself, your manner of navigating life&apos;s journey, and
                aspects of your fortune or luck.
              </p>
              <div className="font-semibold">{profileData?.wuku?.bird}</div>
              <div className="text-sm text-gray-700">
                {profileData?.wuku?.bird_meaning}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
