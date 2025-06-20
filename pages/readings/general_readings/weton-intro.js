import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ArrowLeft, CircleAlertIcon } from "lucide-react";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(window.history);
    }
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
        <div className="navbar-start">
          {/* <Link
            href="/home"
            className="p-2 rounded-full text-xl border border-batik-text hover:bg-base-200"
          >
            <ArrowLeft size={20} className="text-batik-text" />
          </Link> */}
        </div>
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
        <h1 className="text-3xl font-semibold text-left mb-4">About You</h1>
        <section className="flex flex-row gap-5 items-center">
          <div className="text-slate-600">
            <div className="text-sm text-batik-text font-semibold">Weton</div>
            <span className="text-batik-black font-semibold">
              {profileData.dina_pasaran}
            </span>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-left">
            Weton: Your Soul&apos;s Signature
          </h2>
          <p className="text-[10px] text-gray-700 mb-2">
            Your Weton is like a unique spiritual signature, defined by the
            specific day and market day of your birth in the Javanese calendar.
            It reveals the fundamental energies shaping your personality,
            potential, and the subtle rhythms of your life&apos;s journey.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <div className="text-sm font-semibold  text-batik-text">
                Day (Dina)
              </div>
              <div>
                <div className="font-semibold">
                  {profileData.weton?.dina_en} ({profileData.weton?.dina})
                </div>
                <div className="text-sm text-gray-700">
                  {profileData.weton?.day_character?.description}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-batik-text">
                Market Day (Pasaran)
              </div>
              <div className="font-semibold">{profileData.weton?.pasaran}</div>
              <div className="text-sm text-gray-700">
                {profileData.weton?.pasaran_character?.description}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-batik-text">
                Weton Energy
              </div>
              <div className="font-semibold">{profileData.dina_pasaran}</div>
              <div className="text-sm text-gray-700">
                {profileData.weton?.neptu_character?.description}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-batik-text/20 pt-4">
          <h2 className="text-xl font-semibold text-left">
            Your Inner Compass & Life&apos;s Journey
          </h2>
          <p className="text-[10px] text-gray-700 mb-2">
            These elements describe your fundamental character, how you approach
            life, and the innate energies that guide your path.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <div className="text-sm font-semibold  text-batik-text">Laku</div>
              <p className="text-[10px] text-gray-700 italic">
                Laku describes the overarching &quot;manner&quot; or
                &quot;way&quot; your life tends to unfold, like a specific
                archetype or behavioral pattern.
              </p>
              <div>
                <div className="font-semibold">
                  {profileData.weton?.laku?.name} (
                  {profileData.weton?.laku?.meaning})
                </div>
                <div className="text-sm text-gray-700">
                  {profileData.weton?.laku?.description}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold  text-batik-text">
                Pancasuda
              </div>
              <p className="text-[10px] text-gray-700 italic">
                Pancasuda types define your innate &quot;character essence&quot;
                or life&apos;s guiding archetype, revealing the unique talents
                and potential path intricately woven into your birth Weton.
              </p>
              <div>
                <div className="font-semibold">
                  {profileData.weton?.saptawara?.name}
                </div>
                <div className="text-xs leading-4 text-gray-700 mb-1 font-medium ">
                  {profileData.weton?.saptawara?.meaning}
                </div>
                <div className="text-sm text-gray-700">
                  {profileData.weton?.saptawara?.description}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-batik-text/20 pt-4">
          <h2 className="text-xl font-semibold text-left">
            Karmic Tides & Cyclical Patterns
          </h2>
          <p className="text-[10px] text-gray-700 mb-2">
            These aspects point to underlying patterns, cyclical influences from
            different day counts, and potential karmic themes that shape your
            experiences.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <div className="text-sm font-semibold  text-batik-text">
                Rakam
              </div>
              <p className="text-[10px] text-gray-700 italic">
                Rakam suggests a significant life theme or a pattern of
                experiences that may repeat or define distinct periods of your
                life.
              </p>
              <div>
                <div className="font-semibold">
                  {profileData.weton?.rakam?.name}
                </div>
                <div className="text-xs leading-4 text-gray-700 mb-1 font-medium ">
                  {profileData.weton?.rakam?.meaning}
                </div>
                <div className="text-sm text-gray-700">
                  {profileData.weton?.rakam?.description}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold  text-batik-text">
                Sadwara
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
              <div className="text-sm font-semibold  text-batik-text">
                Hastawara
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
                <div className="text-xs leading-4 text-gray-700 mb-1 font-medium ">
                  {profileData.weton?.hastawara?.meaning}
                </div>
                <div className="text-sm text-gray-700">
                  {profileData.weton?.hastawara?.description}
                </div>
              </div>
            </div>
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
    </div>
  );
}
