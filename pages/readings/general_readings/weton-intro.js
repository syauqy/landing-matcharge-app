import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ArrowLeft, CircleAlertIcon, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function BasicReadingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState({
    title: "",
    description: "",
  });

  const tooltipContent = {
    weton:
      "Your Weton is your spiritual signature, a unique energetic blueprint determined by the day you were born. It's created by combining two calendars: the familiar seven-day week (Dina) and the ancient five-day Javanese market cycle (Pasaran). This combination results in one of 35 distinct archetypes, each with its own specific personality traits, strengths, challenges, and path to prosperity. Think of it as the Javanese equivalent of your sun sign, but with a deeper focus on your innate character and destiny, forming the foundation for all other divine readings in this system.",
    dina: "The Dina simply refers to the seven days of the regular week, from Sunday to Saturday. In the Javanese system, however, each day is not just a name but a living energy with a specific numerical value, or neptu. This value represents the day's fundamental character—for instance, one day might carry an energy of movement and speech, while another carries an energy of stillness and stability. The Dina of your birth provides the first layer of your personality, defining the broad strokes of your character and outward demeanor.",
    pasaran:
      'The Pasaran is the mystical heart of the Javanese calendar, a five-day cycle that runs concurrently with the seven-day week. The five days (Legi, Pahing, Pon, Wage, Kliwon), each represent a different spiritual quality or "flavor" of energy, influencing everything from market commerce to metaphysical potency. The Pasaran of your birth infuses your core personality with a deeper, more subtle spiritual influence, governing your inner motivations, your connection to the unseen world, and your natural inclinations in matters of intuition and desire.',
    laku: `Your Laku, which translates to "path" or "behavior," is your elemental archetype, describing how your life force naturally expresses itself. Derived from your Weton's total spiritual value (neptu), your Laku aligns you with a powerful natural force, such as the Sun (Laku Srengenge), Water (Laku Banyu), or Wind (Laku Angin). This reveals your most authentic mode of being—whether you are destined to lead and illuminate, to advise and flow, or to wander and communicate—and provides a guide for how to best navigate the world in harmony with your true nature.`,
    pancasuda: `Pancasuda is a specific calculation that reveals your "Innate Fortune Factor," a core theme related to your luck and prosperity. By analyzing your Weton's numerical value, Pancasuda pinpoints a significant karmic gift or challenge that will consistently appear in your life. For example, your fortune factor might be Tunggak Semi ("The Sprouting Stump"), indicating a miraculous ability to regenerate wealth after a loss, or Lebu Katiup Angin ("Dust in the Wind"), suggesting a lifelong lesson in learning how to maintain stability and hold onto resources.`,
    rakam: `Rakam acts as your "Karmic Imprint", offering a narrative about your destiny, character, and social interactions. Like Pancasuda, it is derived from your Weton, but it provides a broader, more story-driven insight into your life's path. Your Rakam might reveal a destiny of respected authority (Satria Wibawa) or a path of overcoming great trials through courage (Kala Tinantang). It functions as a "verdict" on your fate, highlighting the central virtues you must cultivate or the character flaws you must overcome to achieve your highest potential.`,
  };

  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSheetOpen]);

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

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    setShowTitleInNavbar(scrollPosition > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleShowExplanation = (title, description) => {
    setSheetContent({ title, description });
    setIsSheetOpen(true);
  };

  // console.log("Profile Data:", profileData);

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
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-base-100 text-base-content p-4">
        <div className="alert bg-red-50 text-red-500 max-w-md text-center">
          <div className="flex flex-col gap-3 text-center items-center">
            <CircleAlertIcon className="h-10 w-10" />
            <div className="text-center">Error! {error}</div>
          </div>
        </div>
        <Link
          href="/home"
          className="p-2 px-4 rounded-full text-lg border border-batik-text hover:bg-batik/80 hover:cursor-pointer inline-flex items-center text-batik-text font-medium"
        >
          <ArrowLeft size={20} className="text-batik-text" />
          <span className="ml-2">Back to Home</span>
        </Link>
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
        <div className="navbar-start"></div>
        {showTitleInNavbar && profileData && (
          <div className="navbar-center flex-col">
            <div className="text-xs text-batik-text font-semibold uppercase">
              Weton
            </div>
            <span className="text-batik-black font-semibold text-sm">
              {profileData.dina_pasaran}
            </span>
          </div>
        )}
        <div className="navbar-end"></div>
      </div>

      <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        <h1 className="text-3xl font-semibold text-left mb-4">
          {profileData?.weton?.watak_weton?.archetype}
        </h1>
        <section>
          <div>
            <h2 className="text-xl font-semibold text-left">
              Weton: Your Soul&apos;s Signature
            </h2>
            <p className="text-sm text-gray-700 mb-2">
              Your Weton is like a unique spiritual signature, defined by the
              specific day and market day of your birth in the Javanese
              calendar. It reveals the fundamental energies shaping your
              personality, potential, and the subtle rhythms of your life&apos;s
              journey.
            </p>
          </div>
        </section>
        <section>
          <div className="flex flex-col gap-8">
            <div className="text-slate-600">
              <div className="flex items-center gap-2">
                <div className="text-batik-text font-semibold">Weton</div>
                <button
                  onClick={() =>
                    handleShowExplanation("Weton", tooltipContent?.weton)
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div className="font-semibold text-lg">
                {profileData.dina_pasaran}
              </div>
              <div className="text-base text-gray-700">
                {profileData.weton?.neptu_character?.description}
              </div>
              <div className="text-base text-gray-700 mt-3">
                {profileData.weton?.watak_weton?.description}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-batik-text">Day (Dina)</div>
                <button
                  onClick={() =>
                    handleShowExplanation("Day (Dina)", tooltipContent?.dina)
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {profileData.weton?.dina_en} ({profileData.weton?.dina})
                </div>
                <div className="text-gray-700">
                  {profileData.weton?.day_character?.description}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-batik-text">
                  Market Day (Pasaran)
                </div>
                <button
                  onClick={() =>
                    handleShowExplanation(
                      "Market Day (Pasaran)",
                      tooltipContent?.pasaran
                    )
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div className="text-lg font-semibold">
                {profileData.weton?.pasaran}
              </div>
              <div className="text-gray-700">
                {profileData.weton?.pasaran_character?.description}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-batik-border pt-4">
          <div className="flex flex-col mb-6">
            <h2 className="text-xl font-semibold text-left">
              Your Inner Compass & Life&apos;s Journey
            </h2>
            <p className="text-sm text-gray-700 mb-2">
              These elements describe your fundamental character, how you
              approach life, and the innate energies that guide your path.
            </p>
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="font-semibold  text-batik-text">Laku</div>
                <button
                  onClick={() =>
                    handleShowExplanation("Laku", tooltipContent?.laku)
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {profileData.weton?.laku?.name} (
                  {profileData.weton?.laku?.meaning})
                </div>
                <div className="text-gray-700">
                  {profileData.weton?.laku?.description}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="font-semibold  text-batik-text">Pancasuda</div>
                <button
                  onClick={() =>
                    handleShowExplanation(
                      "Pancasuda",
                      tooltipContent?.pancasuda
                    )
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {profileData.weton?.saptawara?.name}
                </div>
                <div className="text-gray-700 ">
                  {profileData.weton?.saptawara?.meaning}
                </div>
                <div className="text-gray-700 mt-3">
                  {profileData.weton?.saptawara?.description}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-batik-border pt-4">
          <div className="flex flex-col mb-6">
            <h2 className="text-xl font-semibold text-left">
              Karmic Tides & Cyclical Patterns
            </h2>
            <p className="text-sm text-gray-700 mb-2">
              These aspects point to underlying patterns, cyclical influences
              from different day counts, and potential karmic themes that shape
              your experiences.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="font-semibold  text-batik-text">Rakam</div>
                <button
                  onClick={() =>
                    handleShowExplanation("Rakam", tooltipContent?.rakam)
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {profileData.weton?.rakam?.name}
                </div>
                <div className="text-gray-700">
                  {profileData.weton?.rakam?.meaning}
                </div>
                <div className="text-gray-700 mt-3">
                  {profileData.weton?.rakam?.description}
                </div>
              </div>
            </div>
            {/* <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold  text-batik-text">
                  Sadwara
                </div>
                <button
                  onClick={() =>
                    handleShowExplanation(
                      "Sadwara",
                      "Part of a six-day Pawukon cycle (Sadwara), this highlights subtle behavioral tendencies, your approach to responsibility, or social interaction styles."
                    )
                  }
                  className="text-gray-400 hover:text-batik-text"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <p className="text-[10px] text-gray-700 italic">
                Part of a six-day Pawukon cycle (Sadwara), this highlights
                subtle behavioral tendencies, your approach to responsibility,
                or social interaction styles.
              </p>
              <div>
                <div className="font-semibold">
                  {profileData.weton?.sadwara?.name} (
                  {profileData.weton?.sadwara?.meaning})
                </div>
                <div className="text-sm text-gray-700">
                  {profileData.weton?.sadwara?.description}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold  text-batik-text">
                  Hastawara
                </div>
                <button
                  onClick={() =>
                    handleShowExplanation(
                      "Hastawara",
                      "An eight-day Pawukon cycle influence (Hastawara), this can point towards areas of specific luck, potential challenges, or types of activities favored or to be cautious about."
                    )
                  }
                  className="text-gray-400 hover:text-batik-text"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <p className="text-[10px] text-gray-700 italic">
                An eight-day Pawukon cycle influence (Hastawara), this can point
                towards areas of specific luck, potential challenges, or types
                of activities favored or to be cautious about.
              </p>
              <div>
                <div className="font-semibold">
                  {profileData.weton?.hastawara?.name}
                </div>
                <div className="text-[10px] text-gray-700 italic">
                  {profileData.weton?.hastawara?.meaning}
                </div>
                <div className="text-sm text-gray-700">
                  {profileData.weton?.hastawara?.description}
                </div>
              </div>
            </div> */}
          </div>
        </section>

        <section className="border-t border-batik-text/20 pt-4">
          <div className="flex justify-center my-6">
            <button
              onClick={() => router.replace("/readings/general_readings/wuku")}
              className="btn text-lg text-batik-black border bg-batik border-batik-border py-3 px-7 rounded-2xl shadow-sm relative"
            >
              <span class="absolute inline-flex h-full w-1/3 animate-ping rounded-full bg-batik-border-light opacity-50"></span>
              Explore your Wuku details
            </button>
          </div>
        </section>
      </main>

      {isSheetOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-end justify-center animate-fade-in-up"
          onClick={() => setIsSheetOpen(false)}
        >
          <div
            className="bg-base-100 rounded-t-2xl p-5 pb-10 w-full max-w-3xl mx-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-batik-black">
                {sheetContent.title}
              </h3>
              <button
                onClick={() => setIsSheetOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                CLOSE
              </button>
            </div>
            <p className="text-base text-gray-700">
              {sheetContent.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
