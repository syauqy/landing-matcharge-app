import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { HelpCircle } from "lucide-react";
// import { LoadingProfile } from "@/components/layouts/loading-profile";
import { ErrorLayout } from "@/components/layouts/error-page";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { FeedbackSession } from "@/components/readings/feedback-section";

export default function BasicReadingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [reading, setReading] = useState(null);
  const [isLoadingReading, setIsLoadingReading] = useState(true);
  const [readingError, setReadingError] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState({
    title: "",
    description: "",
  });

  const tooltipContent = {
    wuku: `Your Wuku is the 7-day "week" within the 210-day Javanese Pawukon calendar cycle you were born into. Think of it as a more detailed and specific version of a zodiac sign, representing the broader "season" or "chapter" of your birth. There are 30 different Wuku in total, and each one possesses a unique and intricate set of characteristics, influences, and symbolic patrons that define a person's overarching character, fortune, and potential life path. While your Weton is your specific energetic signature, your Wuku provides the larger mythological and cosmological context for your destiny.`,
    god: "The Guardian Deity (Dewa) is the divine patron or guiding spirit assigned to your specific birth-week. Drawing from the Hindu-Javanese pantheon, this deity's character, powers, and story directly influence your own innate virtues, flaws, and life themes. For example, being born under a deity of justice might bestow a strong moral compass and leadership qualities, while a deity of wealth might grant a natural talent for prosperity but also a risk of greed. This divine patronage essentially provides the core personality blueprint and spiritual lesson for everyone born within that Wuku.",
    tree: "The Tree of your Wuku symbolizes your connection to nature, your path of growth, inherent virtues, and the kind of environment where you best flourish.",
    bird: `The Bird of your Wuku represents your ambitions, how you express yourself, your manner of navigating life's journey, and aspects of your fortune or luck.`,
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

  const fetchReadingData = async () => {
    if (!user) {
      setReadingError("User not authenticated.");
      setIsLoadingReading(false);
      return;
    }
    setIsLoadingReading(true);
    setReadingError(null);
    try {
      const { data, error } = await supabase
        .from("readings")
        .select("id, slug, title")
        .eq("user_id", user.id)
        .eq("slug", "wuku")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found, which is fine
        throw error;
      }

      setReading(data);
    } catch (err) {
      console.error("Error fetching reading data:", err);
      setReadingError(
        err.message || "Failed to load reading details. Please try again."
      );
    } finally {
      setIsLoadingReading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Or your app's login page
      return;
    }

    if (!router.isReady || !user) {
      setLoading(true);
      return;
    }

    if (user) {
      fetchReadingData();
    }

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
    return <PageLoadingLayout />;
  }

  if (error) {
    return <ErrorLayout error={error} router={router} />;
  }

  if (!profileData) {
    return (
      <NoProfileLayout
        router={router}
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      {/* <div
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
      </div> */}
      <div
        className={`navbar px-5 bg-base-100 sticky top-0 z-50 transition-all duration-300 ${
          showTitleInNavbar ? "border-b border-batik-border" : ""
        }`}
      >
        <div className="navbar-start"></div>
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
          <p className="text-sm text-gray-700 mb-2">
            Your Wuku is the specific week within the 210-day Javanese Pawukon
            calendar into which you were born. It imprints you with unique
            characteristics, symbolic guardians, and overarching life patterns.
          </p>
        </div>
        <section>
          <div className="flex flex-col gap-8">
            <div className="text-slate-600">
              <div className="flex gap-2 justify-between items-center">
                <div className="text-batik-text font-semibold">Wuku</div>
                <button
                  onClick={() =>
                    handleShowExplanation("Wuku", tooltipContent?.wuku)
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div className="text-batik-black text-lg font-semibold">
                {profileData?.wuku?.name}
              </div>
              <div className="text-gray-700">
                {profileData?.wuku?.character}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex gap-2 justify-between items-center">
                <div className="font-semibold text-batik-text">
                  👑 Guardian Deity
                </div>
                <button
                  onClick={() =>
                    handleShowExplanation("Guardian Deity", tooltipContent?.god)
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div className="text-lg font-semibold">
                {profileData?.wuku?.god}
              </div>
              <div className="text-gray-700">
                {profileData?.wuku?.god_meaning}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex gap-2 justify-between items-center">
                <div className="font-semibold text-batik-text">🌳 Tree</div>
                <button
                  onClick={() =>
                    handleShowExplanation("Wuku's Tree", tooltipContent?.tree)
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div className="text-lg font-semibold">
                {profileData?.wuku?.tree}
              </div>
              <div className="text-gray-700">
                {profileData?.wuku?.tree_meaning}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex gap-2 justify-between items-center">
                <div className="font-semibold text-batik-text">🕊️ Bird</div>
                <button
                  onClick={() =>
                    handleShowExplanation("Wuku's Bird", tooltipContent?.bird)
                  }
                  className="text-batik-text hover:text-batik-text"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div className="text-lg font-semibold">
                {profileData?.wuku?.bird}
              </div>
              <div className="text-gray-700">
                {profileData?.wuku?.bird_meaning}
              </div>
            </div>
          </div>
        </section>
        {reading?.id && <FeedbackSession user={user} reading={reading} />}
        <section className="border-t border-batik-text/20 pt-4">
          <div className="flex justify-center my-6">
            <button
              onClick={() => router.replace("/home?paywall=true")}
              className="btn text-lg text-batik-black border bg-batik border-batik-border py-3 px-7 rounded-2xl shadow-sm relative"
            >
              <span className="absolute inline-flex h-full w-1/3 animate-ping rounded-full bg-batik-border-light opacity-50"></span>
              Discover More Insights
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
