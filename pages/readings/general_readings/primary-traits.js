import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { config } from "@/utils/config";
import { LoadingProfile } from "@/components/layouts/loading-profile";
import { ErrorLayout } from "@/components/layouts/error-page";
import axios from "axios";
import { PromotionBanner } from "@/components/readings/promotion-banner";
import Link from "next/link";

export default function PrimaryTraitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [isTraitsSectionOpen, setIsTraitsSectionOpen] = useState(false);
  const [isInfluenceSectionOpen, setIsInfluenceSectionOpen] = useState(false);
  const [isWisdomSectionOpen, setIsWisdomSectionOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
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
          .select(
            "weton, id, full_name, weton, gender, username, wuku, birth_date"
          )
          .eq("id", user.id)
          .maybeSingle();
        if (profileFetchError) throw profileFetchError;
        if (!userProfile) throw new Error("User profile data not found.");

        setProfileData(userProfile);
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
          .eq("reading_category", "general_readings")
          .eq("slug", "primary-traits")
          .maybeSingle();

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
            const response = await axios.post(
              `${config.api.url}/readings/general/primary-traits`,
              { profile: profileData },
              {
                headers: { "Content-Type": "application/json" },
              }
            );

            setReading(response);
            setLoading(false);
          } catch (err) {
            console.error(
              "Error in fetch or processing response for primary traits:",
              err
            );
            setError(err.message || "Failed to generate daily reading.");
            setLoading(false);
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
      handleGenerateReading();
    }
  }, [profileData]);

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
        className={`navbar px-5 bg-base-100 sticky top-0 z-40 transition-all duration-300 ${
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
            <div className="text-sm text-batik-text font-semibold uppercase">
              Primary Traits
            </div>
          </div>
        )}
        <div className="navbar-end"></div>
      </div>

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <h1 className="text-xl font-semibold text-left">Primary Traits</h1>
          <p className="text-sm text-gray-700 mb-2">
            Identify your most prominent strengths and inherent characteristics.
          </p>
        </div>
        <section>
          <div className="flex flex-col gap-8">
            <div className="text-slate-600">
              <div className="text-batik-text font-semibold">
                🌀 Weton Identity
              </div>
              <div className="text-gray-700">
                {reading?.reading?.weton_identity?.element}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-batik-border pt-4">
          <button
            onClick={() => setIsTraitsSectionOpen(!isTraitsSectionOpen)}
            className="w-full flex justify-between items-center text-left focus:outline-none"
          >
            <h2 className="text-xl font-semibold">Your Traits</h2>
            <ChevronDown
              className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                isTraitsSectionOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              isTraitsSectionOpen
                ? "grid-rows-[1fr] opacity-100 mt-4"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col">
                  <div className="font-semibold text-batik-text">
                    🎭 Character
                  </div>
                  <div className="text-lg font-semibold">
                    {profileData.weton?.laku?.name}
                  </div>
                  <div className="text-gray-700">
                    {reading?.reading?.characters?.laku}
                  </div>
                  <div className="text-gray-700 mt-2">
                    {reading?.reading?.symbol?.philosophy}
                  </div>
                  <PromotionBanner
                    title={`Learn More about ${profileData.weton?.laku?.name}`}
                    content="Discover the archetype and behavioral pattern that guides your life's journey."
                    url={"/readings/general_readings/laku"}
                    pro={true}
                    icon={"🎭"}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-batik-text">
                    💪 Inherent Strengths
                  </div>
                  <ul className="list-disc list-outside text-gray-700 ml-5">
                    {reading?.reading?.characters?.strength?.map((s, i) => (
                      <li key={i} className="text-gray-700">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-batik-text">
                    🌱 Areas for Growth
                  </div>
                  <ul className="list-disc list-outside text-gray-700 ml-5">
                    {reading?.reading?.characters?.growth?.map((g, i) => (
                      <li key={i} className="text-gray-700">
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-batik-border pt-4">
          <button
            onClick={() => setIsInfluenceSectionOpen(!isInfluenceSectionOpen)}
            className="w-full flex justify-between items-center text-left focus:outline-none"
          >
            <h2 className="text-xl font-semibold">
              Weton&apos;s Influence on Life
            </h2>
            <ChevronDown
              className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                isInfluenceSectionOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              isInfluenceSectionOpen
                ? "grid-rows-[1fr] opacity-100 mt-4"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col">
                  <div className="font-semibold  text-batik-text">
                    🌊 Emotional Nature
                  </div>
                  <div className="text-gray-700">
                    {reading?.reading?.influences?.emotion}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold  text-batik-text">
                    💬 Social Interactions
                  </div>
                  <div className="text-gray-700">
                    {reading?.reading?.influences?.social}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold  text-batik-text">
                    👔 Work Ethics
                  </div>
                  <div className="text-gray-700">
                    {reading?.reading?.influences?.work}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold  text-batik-text">
                    💵 Financial Tendencies
                  </div>
                  <div className="text-gray-700">
                    {reading?.reading?.influences?.financial}
                  </div>
                  <PromotionBanner
                    title={`Know Financial Traits`}
                    content="Understand your natural approach to wealth, and financial opportunities."
                    url={"/readings/financials_readings/your-financial"}
                    pro={true}
                    icon={"💰"}
                  />
                </div>

                <div className="flex flex-col">
                  <div className="font-semibold  text-batik-text">
                    🧘🏻‍♀️ Health
                  </div>
                  <div className="text-gray-700">
                    {reading?.reading?.influences?.health}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-batik-border pt-4 pb-6">
          <button
            onClick={() => setIsWisdomSectionOpen(!isWisdomSectionOpen)}
            className="w-full flex justify-between items-center text-left focus:outline-none"
          >
            <h2 className="text-xl font-semibold text-left">
              Embracing Your Weton&apos;s Wisdom
            </h2>
            <ChevronDown
              className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                isWisdomSectionOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              isWisdomSectionOpen
                ? "grid-rows-[1fr] opacity-100 mt-4"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col">
                  <div className="font-semibold  text-batik-text">
                    🤔 Reflection
                  </div>
                  <div className="text-gray-700">
                    {reading?.reading?.wisdom?.reflection}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold  text-batik-text">
                    💌 Message For You
                  </div>
                  <div className="text-gray-700">
                    {reading?.reading?.wisdom?.empowerment}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
