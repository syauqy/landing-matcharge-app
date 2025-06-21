import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { fetchProfileData } from "@/utils/fetch";
import { config } from "@/utils/config";
import dynamic from "next/dynamic";
const ReactJsonView = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
});

export default function SaptawaraPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);

  const disclaimer =
    "While Weton provides valuable insights into inherent tendencies and energetic dynamics, it does not dictate absolute destinies or outcomes in relationships. These insights serve as a guide for self-understanding and for navigating relationships with greater awareness and wisdom, not as a rigid prediction of success or failure. Human agency, conscious effort, open communication, and genuine love are paramount. Every relationship is a unique journey of two individuals, and challenges can always be overcome with dedication.";

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

  const handleGenerateReading = async () => {
    setError(null);
    setLoading(true);

    if (!profileData || !user) {
      setError("Profile data or user not available.");
      setLoading(false);
      return;
    } else {
      try {
        // Check if primary-traits reading exists
        const { data: existingReading, error: fetchError } = await supabase
          .from("readings")
          .select("reading, status")
          .eq("reading_type", "pro")
          .eq("user_id", user.id)
          .eq("reading_category", "general_readings")
          .eq("slug", "saptawara")
          .maybeSingle();

        console.log("Existing Reading:", existingReading, user.id);

        console.log(existingReading);

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        // If reading exists, show it
        if (existingReading) {
          setReading(existingReading);
          setLoading(false);
          return;
        } else if (!existingReading && !fetchError) {
          console.log("No existing reading found, generating new one...");
          setLoading(false);
          try {
            // Generate new reading if none exists
            const response = await fetch(
              `${config.api.url}/readings/general/general-pro-1`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ profile: profileData }),
                credentials: "include",
              }
            );

            const readingData = await response.json();
            setReading(readingData);
          } catch (err) {
            console.error(
              "Error in fetch or processing response for daily reading:",
              err
            );
            setError(err.message || "Failed to generate daily reading.");
          } finally {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Failed to generate reading");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (profileData && user) {
      // Only run if profileData and user exist
      //   handleMonthlyReading();
      //   handleDailyReading();
    }
  }, [profileData]);

  console.log("Profile Data:", profileData);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Loading your profile...</p>
      </div>
    );
  }

  if (loading && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Loading your reading...</p>
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
              Saptawara
            </div>
          </div>
        )}
        <div className="navbar-end"></div>
      </div>

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <h2 className="text-xl font-semibold text-left">Saptawara</h2>
          <p className="text-sm text-gray-700 mb-2">
            Reveal the core pillar of your inner foundation and its potential
            influenced by the seven-day Pawukon cycle.
          </p>
        </div>
        <section>
          <div className="flex flex-col gap-4">
            <button
              className="btn border-batik-border text-batik-text rounded-2xl"
              onClick={handleGenerateReading}
            >
              Generate Reading
            </button>
            {reading && (
              <div className="flex flex-col">
                <div className="text-sm font-semibold  text-batik-text">
                  Saptawara
                </div>

                <ReactJsonView
                  src={reading}
                  theme="bright:inverted"
                  displayObjectSize={false}
                  className="rounded-2xl"
                  displayDataTypes={false}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
