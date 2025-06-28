import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { fetchProfileData } from "@/utils/fetch";
import { config } from "@/utils/config";
import { LoadingProfile } from "@/components/layouts/loading-profile";
import { ErrorLayout } from "@/components/layouts/error-page";

export default function LoveCorePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [isArchetypeSectionOpen, setIsArchetypeSectionOpen] = useState(true);
  const [isEmotionalSectionOpen, setIsEmotionalSectionOpen] = useState(false);
  const [isInterpersonalSectionOpen, setIsInterpersonalSectionOpen] =
    useState(false);
  const [isUnderlyingSectionOpen, setIsUnderlyingSectionOpen] = useState(false);
  const [isPhilosophySectionOpen, setIsPhilosophySectionOpen] = useState(false);

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
          .eq("user_id", user.id)
          .eq("reading_category", "love_readings")
          .eq("slug", "love-core")
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
              `${config.api.url}/readings/love/love-core`,
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
      handleGenerateReading();
    }
  }, [profileData]);

  // console.log("Profile Data:", profileData);

  if (authLoading) {
    return <LoadingProfile />;
  }

  if (loading && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg text-batik-text"></span>
        <p className="mt-4">Loading your reading...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorLayout error={error} router={router} />;
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
              Your Love
            </div>
          </div>
        )}
        <div className="navbar-end"></div>
      </div>

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto  pb-16">
        <div>
          <h2 className="text-xl font-semibold text-left">Your Love</h2>
          <p className="text-sm text-gray-700 mb-2">
            Explore the core of how your Weton shapes your approach to love and
            partnership.
          </p>
        </div>

        {reading?.status === "completed" ? (
          <div className="space-y-6">
            <section className=" pt-4">
              <button
                onClick={() =>
                  setIsArchetypeSectionOpen(!isArchetypeSectionOpen)
                }
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">Romantic Archetype</h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isArchetypeSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isArchetypeSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <div className="text-gray-700">
                      {reading?.reading?.romantic_archetype}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-batik-border pt-4">
              <button
                onClick={() =>
                  setIsEmotionalSectionOpen(!isEmotionalSectionOpen)
                }
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">Emotional Foundation</h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isEmotionalSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isEmotionalSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <div className="text-gray-700">
                      {reading?.reading?.emotional_foundation}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-batik-border pt-4">
              <button
                onClick={() =>
                  setIsInterpersonalSectionOpen(!isInterpersonalSectionOpen)
                }
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">
                  Interpersonal Instincts
                </h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isInterpersonalSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isInterpersonalSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <div className="text-gray-700">
                      {reading?.reading?.interpersonal_instincts}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-batik-border pt-4">
              <button
                onClick={() =>
                  setIsUnderlyingSectionOpen(!isUnderlyingSectionOpen)
                }
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">
                  Underlying Drives in Love
                </h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isUnderlyingSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isUnderlyingSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <div className="text-gray-700">
                      {reading?.reading?.underlying_drives}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-y border-batik-border pt-4 pb-6">
              <button
                onClick={() =>
                  setIsPhilosophySectionOpen(!isPhilosophySectionOpen)
                }
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">
                  Javanese Philosophical Connection
                </h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isPhilosophySectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isPhilosophySectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <div className="text-gray-700">
                      {reading?.reading?.philosophy}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex h-[30rem] flex-col items-center justify-center bg-base-100 text-base-content">
            <span className="loading loading-spinner loading-lg text-rose-400"></span>
            <p className="mt-4">Generating Your Love Reading...</p>
          </div>
        )}

        {/* <section>
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
                  Your Love
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
        </section> */}
      </main>
    </div>
  );
}
