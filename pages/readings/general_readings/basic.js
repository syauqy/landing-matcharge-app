import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";

export default function BasicReadingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Or your app's login page
      return;
    }

    if (!router.isReady || !user) {
      // Wait for router to be ready or user to be loaded
      // setLoading(true) could be set here if not already true by default
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
          .select("weton, wuku, dina_pasaran") // Fetching the objects and dina_pasaran string
          .eq("id", user.id) // 'id' in profiles table is the user_id
          .single(); // Assuming one profile per user
        if (profileFetchError) throw profileFetchError;
        if (!userProfile) throw new Error("User profile data not found.");
        // Ensure weton and wuku are objects, even if they are null/undefined from DB,
        // to prevent access errors like userProfile.weton.name if weton is null.
        // dina_pasaran is expected to be a string.
        const safeProfileData = {
          dina_pasaran: userProfile.dina_pasaran || "N/A",
          weton: userProfile.weton || {},
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

    const { id: readingId } = router.query;

    const fetchReadingDetails = async () => {
      if (!readingId) {
        setError("Reading ID is missing in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Step 1: Validate the readingId and ensure it belongs to the user.
        // This confirms that the user is trying to view a profile
        // in the context of one of their actual readings.
        const { data: readingEntry, error: readingAccessError } = await supabase
          .from("readings")
          .select("id") // Select minimal data, just to confirm existence and ownership
          .eq("id", readingId)
          .eq("user_id", user.id)
          .single();

        if (readingAccessError) throw readingAccessError;
        if (!readingEntry)
          throw new Error("Reading not found or you do not have access to it.");

        // Step 2: Fetch the detailed profile from the 'profiles' table.
        const { data: userProfile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("weton, wuku, dina_pasaran") // Fetching the objects and dina_pasaran string
          .eq("id", user.id) // 'id' in profiles table is the user_id
          .single(); // Assuming one profile per user

        if (profileFetchError) throw profileFetchError;
        if (!userProfile) throw new Error("User profile data not found.");

        // Ensure weton and wuku are objects, even if they are null/undefined from DB,
        // to prevent access errors like userProfile.weton.name if weton is null.
        // dina_pasaran is expected to be a string.
        const safeProfileData = {
          dina_pasaran: userProfile.dina_pasaran || "N/A",
          weton: userProfile.weton || {},
          wuku: userProfile.wuku || {},
        };

        setProfileData(safeProfileData);
      } catch (err) {
        console.error("Error fetching reading details or profile:", err);
        setError(
          err.message || "Failed to load profile details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    // fetchReadingDetails();
    fetchProfileData();
  }, [user]);

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

  // --- Card Components ---
  const ProfileSummaryCard = ({ weton_en, wukuName, total_neptu }) => (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title text-2xl justify-center mb-4">
          Profile Summary
        </h2>
        <div className="text-center">
          <p className="text-xl">
            Your Weton:{" "}
            <span className="font-semibold text-primary">
              {weton_en ?? "N/A"}
            </span>
          </p>
          <p className="text-xl mt-1">
            Your Wuku:{" "}
            <span className="font-semibold text-secondary">
              {wukuName ?? "N/A"}
            </span>
          </p>
          <p className="text-md mt-2 text-base-content/80">
            Total Weton Neptu: {total_neptu ?? "N/A"}
          </p>
        </div>
      </div>
    </div>
  );

  const SectionItem = ({ term, name, meaning, description }) => (
    <div className="mb-3">
      <h4 className="text-md font-semibold">
        {term}: {name || "N/A"} {meaning && `(${meaning})`}
      </h4>
      {description && (
        <p className="text-sm text-base-content/80 mt-1 whitespace-pre-line">
          {description}
        </p>
      )}
    </div>
  );

  const CoreWetonAttributesCard = ({ data }) => (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title">Weton Fundamentals</h3>
        <SectionItem
          term="Day (Dina)"
          name={`${data?.dina_en} (${data?.dina})`}
          description={data?.day_character?.description}
        />
        <SectionItem
          term="Market Day (Pasaran)"
          name={data?.pasaran}
          description={data?.pasaran_character?.description}
        />
        <SectionItem
          term="Weton Energy (Neptu)"
          name={`Total Neptu ${data?.total_neptu}`}
          description={data?.neptu_character?.description}
        />
      </div>
    </div>
  );

  const GuidingInfluencesCard = ({ data }) => (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title">Your Guiding Influences</h3>
        <SectionItem
          term="Laku (Life's Journey)"
          name={data?.laku?.name}
          meaning={data?.laku?.meaning}
          description={data?.laku?.description}
        />
        <SectionItem
          term="Pancasuda (Inner Foundation)"
          name={data?.pancasuda?.name}
          meaning={data?.pancasuda?.meaning}
          description={data?.pancasuda?.description}
        />
        <SectionItem
          term="Saptawara Cycle (Weekly Influence)"
          name={data?.saptawara?.name}
          meaning={data?.saptawara?.meaning}
          description={data?.saptawara?.description}
        />
      </div>
    </div>
  );

  const UnderlyingDynamicsCard = ({ data }) => (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title">Underlying Dynamics</h3>
        <SectionItem
          term="Rakam (Destiny's Imprint)"
          name={data?.rakam?.name}
          meaning={data?.rakam?.meaning}
          description={data?.rakam?.description}
        />
        <SectionItem
          term="Sadwara Cycle (Six-Day Influence)"
          name={data?.sadwara?.name}
          meaning={data?.sadwara?.meaning}
          description={data?.sadwara?.description || data?.sadwara?.association}
        />
        <SectionItem
          term="Hastawara Cycle (Eight-Day Influence)"
          name={data?.hastawara?.name}
          meaning={data?.hastawara?.meaning}
          description={data?.hastawara?.description}
        />
      </div>
    </div>
  );

  const WukuProfileCard = ({ wuku }) => (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title">Wuku Profile: {wuku?.name || "N/A"}</h3>
        <p className="text-sm text-base-content/80 mb-3">
          Wuku Neptu/Bilangan: {wuku?.wuku_bilangan ?? "N/A"}
        </p>
        <SectionItem
          term="Overall Wuku Character"
          description={wuku?.character}
        />
        <h4 className="text-md font-semibold mt-4 mb-2">
          Symbolic Totems of Your Wuku:
        </h4>
        <SectionItem
          term="Deity (Dewa)"
          name={wuku?.god}
          meaning={wuku?.god_meaning}
        />
        <SectionItem
          term="Sacred Tree (Pohon)"
          name={wuku?.tree}
          meaning={wuku?.tree_meaning}
        />
        <SectionItem
          term="Spirit Bird (Burung)"
          name={wuku?.bird}
          meaning={wuku?.bird_meaning}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <div className="navbar bg-base-100 sticky top-0 z-50">
        <div className="navbar-start">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-circle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
        </div>
      </div>

      <main className="p-4 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
        <h1 className="text-3xl font-semibold text-left mb-4">About You</h1>
        <p className="text-base-content/80 mb-4">
          Ever wondered if your birthdate holds a deeper meaning? In Javanese
          culture, it unlocks a rich tapestry of personality insights and
          potential life paths.
        </p>
        <ProfileSummaryCard
          weton_en={profileData.dina_pasaran}
          wukuName={profileData.wuku?.name}
          total_neptu={profileData.weton?.total_neptu}
        />
        <CoreWetonAttributesCard data={profileData.weton} />
        <GuidingInfluencesCard data={profileData.weton} />
        <UnderlyingDynamicsCard data={profileData.weton} />
        <WukuProfileCard wuku={profileData.wuku} />
      </main>
    </div>
  );
}
