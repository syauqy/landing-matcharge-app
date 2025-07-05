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
import Markdown from "markdown-to-jsx";
import { Capacitor } from "@capacitor/core";
// import ReactMarkdown from "react-markdown";
// import axios from "axios";
// import { PromotionBanner } from "@/components/readings/promotion-banner";
import dynamic from "next/dynamic";
const ReactJsonView = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
});

export default function FinancialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [isMindsetSectionOpen, setIsMindsetSectionOpen] = useState(true);
  const [isTendeciesSectionOpen, setIsTendeciesSectionOpen] = useState(false);
  const [isOpportunitiesSectionOpen, setIsOpportunitiesSectionOpen] =
    useState(false);
  const [isPitfallSectionOpen, setIsPitfallSectionOpen] = useState(false);
  const [isAbundantSectionOpen, setIsAbundantSectionOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const disclaimer =
    "These are energetic tendencies, not absolute predictions. Your personal effort, diligent research, and understanding of market conditions remain crucial. This guidance offers insights into your inherent predispositions, but your conscious choices and actions ultimately shape your financial reality.";

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
        const { data: existingReading, error: fetchError } = await supabase
          .from("readings")
          .select("reading, status")
          .eq("reading_type", "pro")
          .eq("user_id", user.id)
          .eq("reading_category", "financial_readings")
          .eq("slug", "your-financial")
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
              `${config.api.url}/readings/financial/financial-pro`,
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
      if (isNative) {
        handleGenerateReading();
      }
    }
  }, [profileData]);

  const introduction = profileData?.weton
    ? `Your ${profileData?.weton?.weton_en} Weton, with a Neptu of ${profileData?.weton?.total_neptu}, combined with your Rakam ${profileData?.weton?.rakam?.name}, provides deep insight into your fundamental character. This combination reveals your innate relationship with money, your general tendencies towards abundance, and how you naturally approach finacial management.`
    : "";

  console.log("Profile Data:", profileData);

  if (authLoading || (loading && !error)) {
    return <LoadingProfile />;
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
            <div className="text-sm text-batik-text font-semibold uppercase">
              Your Financial
            </div>
          </div>
        )}
        <div className="navbar-end"></div>
      </div>

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <h2 className="text-xl font-semibold text-left">Your Financial</h2>
          {profileData?.subscription == "free" && (
            <p className="text-sm text-gray-700 mb-2">{introduction}</p>
          )}
        </div>

        {reading?.status === "completed" ? (
          <div className="space-y-6">
            <section className="pt-4">
              <h2 className="text-sm text-batik-text font-semibold">
                Your Financial Archetype
              </h2>
              <div className="flex flex-col">
                <p className="text-batik-black text-lg font-semibold">
                  {reading?.reading?.archetype}
                </p>
              </div>
            </section>
            <section className="pt-4">
              <button
                onClick={() => setIsMindsetSectionOpen(!isMindsetSectionOpen)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">🤔 Financial Mindset</h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isMindsetSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isMindsetSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <Markdown className="text-gray-700">
                      {reading?.reading?.mindset.replace(/—/gi, ", ")}
                    </Markdown>
                  </div>
                </div>
              </div>
            </section>
            <section className="border-t border-batik-border pt-4">
              <button
                onClick={() =>
                  setIsTendeciesSectionOpen(!isTendeciesSectionOpen)
                }
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">
                  📈 General Wealth Tendencies
                </h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isTendeciesSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isTendeciesSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <Markdown className="text-gray-700">
                      {reading?.reading?.tendencies.replace(/—/gi, ", ")}
                    </Markdown>
                  </div>
                </div>
              </div>
            </section>
            <section className="border-t border-batik-border pt-4">
              <button
                onClick={() =>
                  setIsOpportunitiesSectionOpen(!isOpportunitiesSectionOpen)
                }
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">
                  🎯 Opportunities for Attracting Wealth
                </h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isOpportunitiesSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isOpportunitiesSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <Markdown className="text-gray-700">
                      {reading?.reading?.opportunities.replace(/—/gi, ", ")}
                    </Markdown>
                  </div>
                </div>
              </div>
            </section>
            <section className="border-t border-batik-border pt-4">
              <button
                onClick={() => setIsPitfallSectionOpen(!isPitfallSectionOpen)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">
                  🚧 Pontential Financial Pitfalls
                </h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isPitfallSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isPitfallSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <Markdown className="text-gray-700">
                      {reading?.reading?.pitfalls.replace(/—/gi, ", ")}
                    </Markdown>
                  </div>
                </div>
              </div>
            </section>
            <section className="border-t border-batik-border pt-4">
              <button
                onClick={() => setIsAbundantSectionOpen(!isAbundantSectionOpen)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <h2 className="text-xl font-semibold">
                  🧘 Hidden Strength & Karmic Lesson
                </h2>
                <ChevronDown
                  className={`w-6 h-6 transform transition-transform duration-300 text-batik-text ${
                    isAbundantSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isAbundantSectionOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col">
                    <Markdown className="text-gray-700">
                      {reading?.reading?.karmic.replace(/—/gi, ", ")}
                    </Markdown>
                  </div>
                </div>
              </div>
            </section>
            <section className="p-4 border-slate-100 border rounded-2xl bg-base-100 shadow-md mt-10">
              <p className="text-sm text-gray-700">{disclaimer}</p>
            </section>
          </div>
        ) : (
          <div className="flex h-[30rem] flex-col items-center justify-center bg-base-100 text-base-content">
            <span className="loading loading-spinner loading-lg text-rose-400"></span>
            <p className="mt-4">Generating Your Finacial Reading...</p>
          </div>
        )}

        {!isNative && (
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
                    Your Financial
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
        )}
      </main>
    </div>
  );
}
