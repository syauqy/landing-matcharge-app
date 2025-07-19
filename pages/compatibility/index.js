// pages/profile.js
import Head from "next/head";
import Image from "next/image"; // Import Next.js Image component for optimization
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link for navigation
import { config } from "@/utils/config";
// import { DashboardNavbar } from "@/components/layouts/dashboard-navbar"; // Assuming not used directly
import { Navbar } from "@/components/layouts/navbar";
import { Menubar } from "@/components/layouts/menubar";
import {
  SunIcon,
  MoonStarIcon,
  Loader2,
  HeartIcon,
  Search,
  Users,
  UserPlusIcon,
  SmilePlusIcon,
  XIcon,
} from "lucide-react";
import { getWuku, getWeton, getWetonPrimbon, getWetonJodoh } from "@/utils";
import { format } from "date-fns";
import clsx from "clsx";

export default function CompatibilityPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState(null);
  const [compatibilityReading, setCompatibilityReading] = useState([]);
  const [coupleReading, setCoupleReading] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);

  const [partnerProfile, setPartnerProfile] = useState({});

  // State for Custom Partner Form
  const [showCustomPartnerForm, setShowCustomPartnerForm] = useState(false);
  const [customFullName, setCustomFullName] = useState("");
  const [customBirthDate, setCustomBirthDate] = useState("");
  const [customBirthTime, setCustomBirthTime] = useState("");
  const [customGender, setCustomGender] = useState(""); // Added gender
  const [savingCustomPartner, setSavingCustomPartner] = useState(false);
  const [wetonJodoh, setWetonJodoh] = useState({});

  const [friendsList, setFriendsList] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  // const [selectedFriendId, setSelectedFriendId] = useState(""); // Will be replaced by direct partner selection

  const [customProfilesList, setCustomProfilesList] = useState([]);
  const [loadingCustomProfiles, setLoadingCustomProfiles] = useState(false);
  const [showPartnerSelectionSheet, setShowPartnerSelectionSheet] =
    useState(false);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");

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
          profile_requester:requester_id (id, username, full_name, dina_pasaran, weton, wuku, gender, birth_date, avatar_url),
          profile_addressee:addressee_id (id, username, full_name, dina_pasaran, weton, wuku, gender, birth_date, avatar_url)
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

  const fetchCustomProfiles = async () => {
    if (!user) return;
    setLoadingCustomProfiles(true);
    try {
      const { data, error: customProfilesError } = await supabase
        .from("custom_profiles")
        .select(
          "id, full_name, birth_date, gender, weton, wuku, dina_pasaran, type, username"
        ) // username might be null for custom
        .eq("id", user.id) // Assuming custom_profiles are linked by user_id, but the table structure has `id` as user.id
        .eq("type", "custom");

      if (customProfilesError) throw customProfilesError;
      setCustomProfilesList(data || []);
    } catch (err) {
      console.error("Error fetching custom profiles:", err);
      setError(
        (prevError) => prevError || "Failed to load custom profiles list."
      );
    } finally {
      setLoadingCustomProfiles(false);
    }
  };

  // Handle saving a custom partner
  const handleSaveCustomPartner = async (e) => {
    e.preventDefault();
    if (!user || savingCustomPartner) return;

    if (!customFullName || !customBirthDate || !customGender) {
      setError("Please fill out all custom partner fields.");
      return;
    }

    setSavingCustomPartner(true);
    setError(null);

    try {
      const wetonData = getWeton(customBirthDate);
      const wukuData = getWuku(customBirthDate);

      if (!wetonData || !wukuData) {
        throw new Error("Could not calculate Weton/Wuku from birth date.");
      }

      // Insert into custom_partners table
      const { data, error: insertError } = await supabase
        .from("custom_profiles") // Assuming you have a custom_partners table
        .insert({
          id: user.id,
          full_name: customFullName,
          username:
            customFullName.replace(/\s/g, "").toLowerCase() +
            format(new Date(), "t"),
          birth_date: customBirthDate,
          gender: customGender,
          weton: wetonData,
          wuku: wukuData,
          dina_pasaran: wetonData.weton,
          type: "custom",
        })
        .select("*") // Select the inserted row to get its ID
        .single();

      if (insertError) throw insertError;

      // Add the custom partner to friendships table
      // const { error: friendshipError } = await supabase
      //   .from("friendships")
      //   .insert({
      //     requester_id: user.id,
      //     addressee_id: data.id,
      //     status: "accepted",
      //   });

      // if (friendshipError) throw friendshipError;

      // Set the newly created custom partner as the active partner profile
      setPartnerProfile(data);
      setWetonJodoh({}); // Reset Weton Jodoh calculation
      setShowCustomPartnerForm(false); // Close the bottom sheet
      fetchCustomProfiles(); // Refresh custom profiles list
      resetCustomPartnerForm();
    } catch (err) {
      console.error("Error saving custom partner:", err);
      setError(err.message || "Failed to save custom partner.");
    } finally {
      setSavingCustomPartner(false);
    }
  };

  const resetCustomPartnerForm = () => {
    setCustomFullName("");
    setCustomBirthDate("");
    setCustomGender("");
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
          .or(
            `and(user_id.eq.${user.id},user_target_id.eq.${partnerProfile.id}),and(user_target_id.eq.${user.id},user_id.eq.${partnerProfile.id})`
          )
          // .eq(
          //   "slug",
          //   `${profileData.username}-${partnerProfile.username}-compatibility`
          // )
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
            const response = await fetch(
              `${config.api.url}/compatibility/love`,
              {
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
              }
            );

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
            const response = await fetch(
              `${config.api.url}/compatibility/couple`,
              {
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
              }
            );

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
        fetchCustomProfiles();
      }
    }
  }, [user, authLoading, router]); // Dependencies

  // --- Loading States ---
  if (authLoading || (!profileData && loadingProfile)) {
    // Show loading if auth is loading OR if profile hasn't loaded yet
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <p className="text-batik-black">Loading Profile...</p>
      </div>
    );
  }

  console.log(customBirthDate, customBirthTime);

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
        <Navbar title="Compatibility" isConnection={true} isBack={true} />
        {/* Main Content Area */}
        <div className="flex-grow overflow-y-auto justify-center pt-4 sm:pt-6 pb-20 px-5">
          <div className="flex-col items-center text-center mb-4">
            <div className="text-sm my-5">
              Select a partner to create a Love Compatibility reading and see
              the relationship dynamics.
            </div>
            <div className="flex my-4 flex-row justify-between">
              {profileData && (
                <div className="p-2 flex-col flex items-center w-[45%]">
                  <h3 className="font-semibold text-lg mb-2">
                    {profileData?.full_name.split(" ")[0] || "User Name"}
                  </h3>
                  <div className="avatar">
                    <div className="size-24 ring-3 ring-offset-2 ring-batik-border rounded-full">
                      <img
                        src={
                          profileData?.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            profileData.full_name
                          )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`
                        }
                        alt={profileData.full_name}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-batik-black"></p>
                    <div className="flex flex-col items-center text-sm">
                      <div className="flex items-center gap-1">
                        {profileData?.weton?.weton_en}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex-grow w-fit">
                <div className="flex h-full justify-center items-center text-2xl font-semibold">
                  💖
                </div>
              </div>

              {partnerProfile.id ? (
                <div className="p-2 flex-col flex items-center w-[45%] ">
                  <h3 className="text-lg font-semibold mb-2">
                    {partnerProfile?.full_name.split(" ")[0] || "Partner Name"}
                  </h3>
                  <div className="avatar">
                    <div className="size-24 ring-3 ring-offset-2 ring-batik-border rounded-full">
                      <img
                        src={
                          partnerProfile?.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            partnerProfile.full_name
                          )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`
                        }
                        alt={partnerProfile.full_name}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-col items-center text-sm">
                      <div className="flex items-center gap-1">
                        {partnerProfile?.weton?.weton_en}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2 flex-col flex items-center w-[45%] ">
                  <h3 className="text-lg font-semibold mb-2">
                    {partnerProfile?.full_name?.split(" ")[0] || "Partner"}
                  </h3>
                  <div className="avatar">
                    <div className=" size-24 ring-3 ring-offset-2 ring-batik-border rounded-full bg-batik-border">
                      <div className="flex h-full justify-center items-center">
                        <SmilePlusIcon size={30} className="text-batik-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-5 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 px-5 my-6 flex flex-col items-center gap-4 w-full">
            <div className="w-full max-w-md">
              <button
                onClick={() => setShowPartnerSelectionSheet(true)}
                className="w-full rounded-2xl bg-rose-400 text-white py-2.5 font-bold"
              >
                Select a Partner
              </button>
            </div>

            {/* <div className="w-full max-w-md">
              <Link
                href="/compatibility/custom"
                className="btn btn-outline w-full"
              >
                <UserPlusIcon size={18} className="mr-2" />
                Go to Custom Compatibility
              </Link>
            </div> */}

            {/* Add Custom Partner Button */}
            {/* <button
              onClick={() => setShowCustomPartnerForm(true)}
              className="btn btn-outline btn-sm w-full max-w-md"
            >
              <UserPlusIcon size={18} className="mr-2" />
              Add Custom Partner
            </button> */}

            {partnerProfile.id && profileData?.weton && (
              <button
                onClick={calculateWetonJodoh}
                className="btn btn-primary"
                disabled={!partnerProfile.weton || !profileData.weton}
              >
                Get Weton Jodoh
              </button>
            )}
            {wetonJodoh.jodoh4 && partnerProfile.id && (
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
            {wetonJodoh.jodoh4 && partnerProfile.id && (
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

        {/* Partner Selection Bottom Sheet */}
        {showPartnerSelectionSheet && (
          <div className="fixed inset-0 bg-slate-500/40 bg-opacity-10 z-40 flex items-end justify-center">
            <div className="bg-base-100 rounded-t-lg p-4 w-full max-w-md shadow-lg h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-base-300">
                <h3 className="text-lg font-bold text-batik-black">
                  Select a Partner
                </h3>
                <button
                  onClick={() => setShowPartnerSelectionSheet(false)}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  CLOSE
                </button>
              </div>
              <div className="flex-grow overflow-y-auto space-y-4">
                <div className="overflow-y-scroll max-h-[75%]">
                  {(loadingFriends || loadingCustomProfiles) && (
                    <div className="text-center py-4">
                      <Loader2
                        size={24}
                        className="animate-spin mx-auto text-batik-black"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Loading partners...
                      </p>
                    </div>
                  )}
                  {!loadingFriends &&
                    !loadingCustomProfiles &&
                    friendsList.length === 0 &&
                    customProfilesList.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No friends or custom profiles found.
                      </p>
                    )}
                  {[...friendsList, ...customProfilesList]
                    .filter(
                      (partner) =>
                        (partner.full_name?.toLowerCase() || "").includes(
                          partnerSearchTerm
                        ) ||
                        (partner.username?.toLowerCase() || "").includes(
                          partnerSearchTerm
                        )
                    )
                    .map((partner) => (
                      <div
                        key={partner.id + (partner.type || "friend")} // Ensure unique key if IDs might overlap (though unlikely with UUIDs)
                        onClick={() => {
                          setPartnerProfile(partner);
                          setWetonJodoh({});
                          setShowPartnerSelectionSheet(false);
                          setPartnerSearchTerm(""); // Reset search
                        }}
                        className="flex-row gap-3 p-3 bg-base-100 rounded-2xl shadow-xs border border-batik-border flex items-center mb-3"
                      >
                        <div className="avatar">
                          <div className="w-12 rounded-full ring-batik-border">
                            <img
                              src={
                                partner?.avatar_url
                                  ? partner?.avatar_url
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      partner.full_name
                                    )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`
                              }
                              alt={partner.full_name}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 max-w-[80%]">
                          <div className="flex flex-row gap-2 items-end leading-4">
                            <p className="font-semibold text-batik-black text-ellipsis overflow-hidden text-nowrap">
                              {partner.full_name || partner.username}
                            </p>
                            <p className="text-xs text-gray-500 leading-3.5 text-ellipsis overflow-hidden text-nowrap">
                              @{partner.username}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <div className="flex items-center gap-1">
                              <SunIcon size={12} />
                              {partner?.weton?.laku?.name}
                            </div>
                            <>&bull;</>
                            <div className="flex items-center gap-1">
                              <MoonStarIcon size={12} />
                              {partner?.wuku?.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {!loadingFriends &&
                    !loadingCustomProfiles &&
                    [...friendsList, ...customProfilesList].filter(
                      (partner) =>
                        (partner.full_name?.toLowerCase() || "").includes(
                          partnerSearchTerm
                        ) ||
                        (partner.username?.toLowerCase() || "").includes(
                          partnerSearchTerm
                        )
                    ).length === 0 &&
                    partnerSearchTerm !== "" && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No results for {partnerSearchTerm}.
                      </p>
                    )}
                </div>

                <div>
                  <Link
                    href="/connections"
                    className="btn btn-outline w-full rounded-2xl max-w-md border-slate-200 py-2.5 font-semibold text-slate-600"
                  >
                    <span className="mr-1">😁</span>
                    Add New Friends
                  </Link>
                  <div className="divider text-batik-text text-sm">OR</div>
                  <button
                    onClick={() => setShowCustomPartnerForm(true)}
                    className="btn btn-outline w-full rounded-2xl max-w-md border-slate-200 py-2.5 font-semibold text-slate-600"
                  >
                    <span className="mr-1">🎭</span>
                    Add Custom Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Partner Bottom Sheet/Modal */}
        {showCustomPartnerForm && (
          <div className="fixed inset-0 bg-slate-500/40 bg-opacity-10 z-50 flex items-end justify-center">
            <div className="bg-base-100 rounded-t-lg p-6 w-full max-w-md shadow-lg transform transition-transform duration-300 ease-out translate-y-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-batik-black">
                  Add Custom Profile
                </h3>
                <button
                  onClick={() => {
                    setShowCustomPartnerForm(false);
                    resetCustomPartnerForm();
                  }}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  CLOSE
                </button>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSaveCustomPartner} className="space-y-4">
                <div>
                  <label
                    htmlFor="customFullName"
                    className="block text-sm text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="customFullName"
                    value={customFullName}
                    onChange={(e) => setCustomFullName(e.target.value)}
                    className="w-full px-3 py-2 font-semibold border-2 border-batik/70 text-base rounded-2xl focus:border-batik-border-light focus:border-2 bg-batik/70 appearance-none focus:outline-hidden"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div>
                    <label
                      htmlFor="customBirthDate"
                      className="block text-sm text-gray-700 mb-1"
                    >
                      Birth Date
                    </label>
                    <input
                      type="date"
                      id="customBirthDate"
                      value={customBirthDate}
                      onChange={(e) => setCustomBirthDate(e.target.value)}
                      className="w-full px-3 py-2 font-semibold border-2 border-batik/70 text-base rounded-2xl focus:border-batik-border-light focus:border-2 bg-batik/70 appearance-none focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="customBirthTime"
                      className="block text-sm text-gray-700 mb-1"
                    >
                      Birth Time
                    </label>
                    <input
                      type="time"
                      id="customBirthTime"
                      value={customBirthTime}
                      onChange={(e) => setCustomBirthTime(e.target.value)}
                      className="w-full px-3 py-2 font-semibold border-2 border-batik/70 text-base rounded-2xl focus:border-batik-border-light focus:border-2 bg-batik/70 appearance-none focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="customGender"
                    className="block text-sm text-gray-700 mb-1"
                  >
                    Gender
                  </label>
                  <select
                    id="customGender"
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    className={clsx(
                      customGender === "" ? "text-slate-400" : "text-gray-700",
                      "w-full px-3 py-2 pr-10 font-semibold border-2 border-batik/70 text-base rounded-2xl focus:border-batik-border-light appearance-none focus:border-2 bg-batik/70 focus:outline-hidden"
                    )}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl max-w-md bg-rose-400 py-2.5 font-semibold text-white mb-3"
                  disabled={savingCustomPartner}
                >
                  {savingCustomPartner ? (
                    <Loader2 size={20} className="animate-spin mr-2" />
                  ) : null}
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        )}
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
