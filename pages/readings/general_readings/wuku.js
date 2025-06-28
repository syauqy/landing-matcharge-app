import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { LoadingProfile } from "@/components/layouts/loading-profile";

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

  console.log("Profile Data:", profileData);

  if (authLoading || (loading && !error)) {
    return <LoadingProfile />;
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
        <button
          onClick={() => router.back()}
          className="p-2 px-4 rounded-full text-lg border border-batik-text hover:bg-batik/80 hover:cursor-pointer inline-flex items-center text-batik-text font-medium"
        >
          <ArrowLeft size={20} className="text-batik-text" />
          <span className="ml-2">Go Back</span>
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
          <p className="text-sm text-gray-700 mb-2">
            Your Wuku is the specific week within the 210-day Javanese Pawukon
            calendar into which you were born. It imprints you with unique
            characteristics, symbolic guardians, and overarching life patterns.
          </p>
        </div>
        <section>
          <div className="flex flex-col gap-8">
            <div className="text-slate-600">
              <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-2">
                <div className="font-semibold text-batik-text">
                  Guardian Deity
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
              <div className="flex items-center gap-2">
                <div className="font-semibold text-batik-text">Tree</div>
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
              <div className="flex items-center gap-2">
                <div className="font-semibold text-batik-text">Bird</div>
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
