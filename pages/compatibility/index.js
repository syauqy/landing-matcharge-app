// pages/profile.js
import Head from "next/head";
import Image from "next/image"; // Import Next.js Image component for optimization
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link for navigation
// import { DashboardNavbar } from "@/components/layouts/dashboard-navbar"; // Assuming not used directly
import { Navbar } from "@/components/layouts/navbar";
import { Menubar } from "@/components/layouts/menubar";
import { SunIcon, MoonStarIcon } from "lucide-react";
import { getWuku, getWeton, getWetonPrimbon, getWetonJodoh } from "@/utils";

export default function CompatibilityPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState(null);
  const [compatibilityReading, setCompatibilityReading] = useState([]);
  const [coupleReading, setCoupleReading] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  // const [activeTab, setActiveTab] = useState("weton"); // Seems unused

  // const [birthDate, setBirthDate] = useState(""); // Will be replaced by friend selection
  const [partnerProfile, setPartnerProfile] = useState({});
  const [wetonJodoh, setWetonJodoh] = useState({});

  const [friendsList, setFriendsList] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState("");

  const fetchProfile = async () => {
    if (!user) return;
    setLoadingProfile(true);
    setError(null);
    try {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*") // Select all profile fields
        .eq("id", user.id)
        .single(); // Expect only one profile

      if (profileError) {
        // Handle case where profile might not exist yet
        if (profileError.code === "PGRST116") {
          console.warn("Profile not found for user:", user.id);
          setError("Profile not found. Please complete setup.");
          // Optionally redirect to profile setup page
          // router.push('/profile-setup');
        } else {
          throw profileError;
        }
      }
      setProfileData(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchFriends = async () => {
    if (!user) return;
    setLoadingFriends(true);
    setError(null);
    try {
      const { data, error: friendsError } = await supabase
        .from("friendships")
        .select(
          `
          id,
          requester_id,
          addressee_id,
          profile_requester:requester_id (id, username, full_name, dina_pasaran, weton, wuku, gender, birth_date),
          profile_addressee:addressee_id (id, username, full_name, dina_pasaran, weton, wuku, gender, birth_date)
        `
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (friendsError) throw friendsError;

      const friendProfiles = data
        .map((friendship) => {
          const friend =
            friendship.requester_id === user.id
              ? friendship.profile_addressee
              : friendship.profile_requester;
          // Ensure all necessary fields are present for a partner profile
          if (friend && friend.weton && friend.wuku) {
            return friend;
          }
          return null;
        })
        .filter(Boolean); // Remove nulls if any friend profile is incomplete

      setFriendsList(friendProfiles || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setError((prevError) => prevError || "Failed to load friends list.");
    } finally {
      setLoadingFriends(false);
    }
  };

  const calculateWetonJodoh = async () => {
    if (!partnerProfile?.weton || !profileData?.weton) return; // Ensure weton data is present
    try {
      const result = await getWetonJodoh(profileData, partnerProfile);
      setWetonJodoh(result);
    } catch (error) {
      console.error("Error calculating Weton Jodoh:", error);
      setError("Failed to calculate Weton Jodoh.");
    }
  };

  const handleCompatibilityReading = async () => {
    setError(null);
    setLoading(true);

    if (!profileData?.username || !user || !partnerProfile?.username) {
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
          .eq("reading_category", "compatibility")
          .eq(
            "slug",
            `${profileData.username}-${partnerProfile.username}-compatibility`
          )
          .maybeSingle();

        console.log("Existing Reading:", existingReading, user.id);

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        // If reading exists, show it
        if (existingReading) {
          setCompatibilityReading(existingReading);
          setLoading(false);
          return;
        } else if (!existingReading && !fetchError) {
          console.log("No existing reading found, generating new one...");
          setLoading(false);
          try {
            // Generate new reading if none exists
            const response = await fetch("/api/compatibility/love", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                profile1: profileData,
                profile2: partnerProfile,
                wetonJodoh: wetonJodoh,
              }),
              credentials: "include",
            });

            const readingData = await response.json();
            setCompatibilityReading(readingData);
          } catch (err) {
            console.error("Error:", err);
            setError(err.message || "Failed to generate reading");
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error checking today's reading:", err);
        setError("Failed to check today's reading.");
        setLoading(false);
      }
    }
  };

  const handleCoupleReading = async () => {
    setError(null);
    setLoading(true);

    if (!profileData?.username || !user || !partnerProfile?.username) {
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
          .eq("reading_category", "compatibility")
          .eq(
            "slug",
            `${profileData.username}-${partnerProfile.username}-couple`
          )
          .maybeSingle();

        console.log("Existing Reading:", existingReading, user.id);

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        // If reading exists, show it
        if (existingReading) {
          setCoupleReading(existingReading);
          setLoading(false);
          return;
        } else if (!existingReading && !fetchError) {
          console.log("No existing reading found, generating new one...");
          setLoading(false);
          try {
            // Generate new reading if none exists
            const response = await fetch("/api/compatibility/couple", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                profile1: profileData,
                profile2: partnerProfile,
                wetonJodoh: wetonJodoh,
              }),
              credentials: "include",
            });

            const readingData = await response.json();
            setCoupleReading(readingData);
          } catch (err) {
            console.error("Error:", err);
            setError(err.message || "Failed to generate reading");
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error checking today's reading:", err);
        setError("Failed to check today's reading.");
        setLoading(false);
      }
    }
  };

  // --- Auth Effect & Initial Data Fetch ---
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/");
      } else {
        fetchProfile();
        fetchFriends();
      }
    }
  }, [user, authLoading, router]); // Dependencies

  // Effect to set partnerProfile when a friend is selected
  useEffect(() => {
    if (selectedFriendId && friendsList.length > 0) {
      const selected = friendsList.find(
        (friend) => friend.id === selectedFriendId
      );
      if (selected) {
        setPartnerProfile(selected);
        setWetonJodoh({}); // Reset previous Weton Jodoh result
      }
    } else if (!selectedFriendId) {
      setPartnerProfile({}); // Clear partner profile if no friend is selected
      setWetonJodoh({});
    }
  }, [selectedFriendId, friendsList]);

  // --- Logout Handler ---
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // --- Loading States ---
  if (authLoading || (!profileData && loadingProfile)) {
    // Show loading if auth is loading OR if profile hasn't loaded yet
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <p className="text-batik-black">Loading Profile...</p>
      </div>
    );
  }

  //r);

  // --- Generate Avatar URL ---
  const avatarUrl = profileData?.full_name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
        profileData.full_name
      )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true` // Example colors, adjust as needed
    : null; // Handle case where full_name might be missing

  return (
    <>
      <Head>
        <title>Compatibility - Wetonscope</title>
        <meta
          name="description"
          content="View your profile details and reading history."
        />
      </Head>

      {/* --- Main Layout Container --- */}
      <div className="h-[100svh] flex flex-col bg-base relative">
        <Navbar title="Compatibility" isConnection={true} />
        <div className="flex-grow overflow-y-auto justify-center pt-4 sm:pt-6 pb-20">
          {profileData && (
            <div className="px-5 mb-6 flex items-center gap-4">
              <div className="avatar">
                <div className="w-16 rounded-full">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profileData.full_name
                    )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`}
                    alt={profileData.full_name}
                  />
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-batik-black">
                  {profileData?.full_name || "User Name"}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <SunIcon size={12} />
                    {profileData?.dina_pasaran}
                  </div>
                  <>&bull;</>
                  <div className="flex items-center gap-1">
                    <MoonStarIcon size={12} />
                    {profileData?.wuku?.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-5 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3 px-5 mb-6 flex flex-col items-center gap-4">
            {/* Friend Selector */}
            <div className="w-full max-w-md">
              <label
                htmlFor="friendSelect"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select a Friend for Compatibility
              </label>
              <select
                id="friendSelect"
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value)}
                className="select select-bordered w-full"
                disabled={loadingFriends || friendsList.length === 0}
              >
                <option value="">
                  {loadingFriends
                    ? "Loading friends..."
                    : friendsList.length === 0
                    ? "No friends available"
                    : "-- Select a Friend --"}
                </option>
                {friendsList.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.full_name || friend.username}
                  </option>
                ))}
              </select>
            </div>
            {partnerProfile.username && ( // Check if a partner is selected
              <div className="bg-base-100 rounded-lg p-4 md:p-6 mb-6 border border-[var(--color-batik-border)] w-full">
                <h3 className="text-lg font-semibold mb-2">Partner Profile</h3>
                <div className="space-y-3 text-sm">
                  <DetailItem
                    label="Full Name"
                    value={partnerProfile.full_name}
                    isBold={true}
                  />
                  <DetailItem
                    label="Birth Date"
                    value={
                      partnerProfile.birth_date
                        ? new Date(
                            partnerProfile.birth_date
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"
                    }
                  />
                  <DetailItem
                    label="Dina Pasaran"
                    value={partnerProfile.dina_pasaran}
                  />
                  <DetailItem label="Wuku" value={partnerProfile.wuku?.name} />
                  <DetailItem
                    label="Total Neptu"
                    value={partnerProfile.weton?.total_neptu}
                  />
                </div>
              </div>
            )}
            {partnerProfile.username && (
              <button
                onClick={calculateWetonJodoh}
                className="btn btn-primary"
                disabled={!partnerProfile.weton || !profileData.weton}
              >
                Get Weton Jodoh
              </button>
            )}
            {wetonJodoh.jodoh4 &&
              partnerProfile.username && ( // Check if Weton Jodoh has been calculated for the selected partner
                <div className="bg-base-100 rounded-lg p-4 md:p-6 mb-6 border border-[var(--color-batik-border)] w-full">
                  <h3 className="text-lg font-semibold mb-2">Weton Jodoh</h3>
                  <div className="space-y-3 text-sm">
                    <DetailItem
                      label="Division 4"
                      value={wetonJodoh.jodoh4?.name}
                    />
                    <DetailItem
                      label="Division 5"
                      value={wetonJodoh.jodoh5?.name}
                    />
                    <DetailItem
                      label="Division 7"
                      value={wetonJodoh.jodoh7?.name}
                    />
                    <DetailItem
                      label="Division 8"
                      value={wetonJodoh.jodoh8?.name}
                    />
                  </div>
                </div>
              )}
            {wetonJodoh.jodoh4 && partnerProfile.username && (
              <>
                <button
                  onClick={handleCompatibilityReading}
                  className="btn btn-accent"
                  disabled={loading || !wetonJodoh.jodoh4}
                >
                  {loading && compatibilityReading.length === 0
                    ? "Generating..."
                    : "Get Love Reading"}
                </button>
                {compatibilityReading.reading && (
                  <div className="border p-4 rounded-md mt-4 w-full">
                    <h2 className="font-bold text-lg mb-2">
                      Love Compatibility Reading
                    </h2>
                    {compatibilityReading.status === "pending" ? (
                      <div className="text-center p-4">
                        <span className="loading loading-dots loading-md"></span>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                        {JSON.stringify(compatibilityReading.reading, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
                <button
                  onClick={handleCoupleReading}
                  className="btn btn-secondary"
                  disabled={loading || !wetonJodoh.jodoh4}
                >
                  {loading && coupleReading.length === 0
                    ? "Generating..."
                    : "Get Couple Dynamics Reading"}
                </button>
                {coupleReading.reading && (
                  <div className="border p-4 rounded-md mt-4 w-full">
                    <h2 className="font-bold text-lg mb-2">
                      Couple Dynamics Reading
                    </h2>
                    {coupleReading.status === "pending" ? (
                      <div className="text-center p-4">
                        <span className="loading loading-dots loading-md"></span>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                        {JSON.stringify(coupleReading.reading, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Menubar page={"compatibility"} />
      </div>
    </>
  );
}

// Helper component for displaying profile details neatly
const DetailItem = ({ label, value, isBold = false }) => (
  <div>
    <span className="text-gray-500">{label}:</span>
    <span
      className={`ml-2 capitalize ${
        isBold ? "font-semibold text-batik-black" : "text-gray-700"
      }`}
    >
      {value !== null && value !== undefined ? value : "N/A"}
    </span>
  </div>
);
