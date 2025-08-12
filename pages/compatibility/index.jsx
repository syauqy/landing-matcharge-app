// pages/profile.js
import Head from "next/head";
// import Image from "next/image"; // Import Next.js Image component for optimization
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link for navigation
import { config } from "@/utils/config";
import { Navbar } from "@/components/layouts/navbar";
import { Menubar } from "@/components/layouts/menubar";
import { LoveCompatibilityCard } from "@/components/readings/love-compatibility-card";
import { FriendshipCompatibilityCard } from "@/components/readings/friendship-compatibility-card";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { HomeLoadingSkeleton } from "@/components/layouts/home-loading-skeleton";
import { CompatibilityLoadingSkeleton } from "@/components/layouts/compatibility-loading-skeleton";
import { ReadingLoading } from "@/components/readings/reading-loading";
import {
  SunIcon,
  MoonStarIcon,
  Loader2,
  SmilePlusIcon,
  ChevronDown,
} from "lucide-react";
import {
  getWuku,
  getWeton,
  getWetonJodoh,
  getCompatibilitySlug,
} from "@/utils";
import { format } from "date-fns";
import clsx from "clsx";
import {
  coupleLoadingMessages,
  friendshipLoadingMessages,
} from "@/lib/loading-content";
import { AnimatedLoadingText } from "@/components/readings/AnimatedLoadingText";
import { useSubscription } from "@/utils/useSubscription";

export default function CompatibilityPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { presentPaywall, isProcessing } = useSubscription();

  const [profileData, setProfileData] = useState(null);
  const [coupleReading, setCoupleReading] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [compatibilityType, setCompatibilityType] = useState("love");

  const [partnerProfile, setPartnerProfile] = useState({});

  // State for Custom Partner Form
  const [showCustomPartnerForm, setShowCustomPartnerForm] = useState(false);
  const [customFullName, setCustomFullName] = useState("");
  const [customBirthDate, setCustomBirthDate] = useState("");
  const [customBirthTime, setCustomBirthTime] = useState("");
  const [showBirthTimeChecker, setShowBirthTimeChecker] = useState(false);
  const [customGender, setCustomGender] = useState(""); // Added gender
  const [savingCustomPartner, setSavingCustomPartner] = useState(true);
  const [wetonJodoh, setWetonJodoh] = useState({});
  const [selectedPartnerReading, setSelectedPartnerReading] = useState(null);

  const [friendsList, setFriendsList] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  // const [selectedFriendId, setSelectedFriendId] = useState(""); // Will be replaced by direct partner selection

  const [customProfilesList, setCustomProfilesList] = useState([]);
  const [loadingCustomProfiles, setLoadingCustomProfiles] = useState(false);
  const [showPartnerSelectionSheet, setShowPartnerSelectionSheet] =
    useState(false);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Or your app's login page
      return;
    }

    if (!router.isReady || !user) {
      setLoading(true);
      return;
    }

    fetchProfile();
  }, []);

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
      console.log("birth time:", customBirthTime);

      const wetonData = getWeton(customBirthDate, customBirthTime);
      const wukuData = getWuku(customBirthDate, customBirthTime);

      if (!wetonData || !wukuData) {
        throw new Error("Could not calculate Weton/Wuku from birth date.");
      }

      // console.log("Weton Data:", wetonData, "Wuku Data:", wukuData);

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
        .select("*")
        .single();

      // if (insertError) throw insertError;

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

  const calculateWetonJodoh = async (partnerProfile) => {
    if (!partnerProfile?.weton || !profileData?.weton) return; // Ensure weton data is present
    try {
      const result = getWetonJodoh(profileData, partnerProfile);
      setWetonJodoh(result);
    } catch (error) {
      console.error("Error calculating Weton Jodoh:", error);
      setError("Failed to calculate Weton Jodoh.");
    }
  };

  const fetchSelectedPartnerReading = async (partner, type) => {
    if (!profileData?.username || !user || !partner?.username) return;
    setError(null);

    try {
      const slug1Base = `${profileData.username}-${partner.username}`;
      const slug2Base = `${partner.username}-${profileData.username}`;

      const orConditions = [
        `and(user_id.eq.${user.id},or(slug.eq.${slug1Base}-${
          type == "love" ? "couple" : "friendship"
        }))`,
        `and(user_id.eq.${partner.id},or(slug.eq.${slug2Base}-${
          type == "love" ? "couple" : "friendship"
        }))`,
      ].join(",");

      const slug =
        type === "love"
          ? `${profileData.username}-${partner.username}-couple`
          : `${profileData.username}-${partner.username}-friendship`;

      const { data: existingReading, error: fetchError } = await supabase
        .from("readings")
        .select("reading, status, slug, title")
        .eq("reading_type", "pro")
        // .eq("user_id", user.id)
        .eq("reading_category", "compatibility")
        .or(orConditions)
        .order("created_at", { ascending: false })
        // .eq("slug", slug)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingReading) {
        setSelectedPartnerReading(existingReading);
      } else {
        setSelectedPartnerReading(null);
      }
    } catch (err) {
      setError("Failed to fetch compatibility reading.");
      setSelectedPartnerReading(null);
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
        setLoading(true);

        const slug =
          compatibilityType === "love"
            ? `${profileData.username}-${partnerProfile.username}-couple`
            : `${profileData.username}-${partnerProfile.username}-friendship`;

        const title =
          compatibilityType === "love"
            ? `${profileData.full_name.split(" ")[0]} and ${
                partnerProfile.full_name.split(" ")[0]
              }'s Love`
            : `${profileData.full_name.split(" ")[0]} and ${
                partnerProfile.full_name.split(" ")[0]
              }'s Friendship`;

        const { data: existingReading, error: fetchError } = await supabase
          .from("readings")
          .select("reading, status, slug")
          .eq("reading_type", "pro")
          .eq("user_id", user.id)
          .eq("reading_category", "compatibility")
          .eq("slug", slug)
          .maybeSingle();

        console.log("Existing Reading:", existingReading, user.id);

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        // If reading exists, show it
        if (existingReading) {
          setCoupleReading(existingReading);
          const readingType = getCompatibilitySlug(slug);
          router.push(`/readings/compatibility/${readingType}?slug=${slug}`);
          setLoading(false);
          return;
        } else if (!existingReading && !fetchError) {
          console.log("No existing reading found, generating new one...");
          setLoading(false);

          try {
            const { data: newCompatibilityReading, error } = await supabase
              .from("readings")
              .insert({
                reading_type: "pro",
                reading_category: "compatibility",
                title: title,
                username: profileData.username,
                status: "loading",
                slug: slug,
                user_id: profileData.id,
              })
              .select()
              .maybeSingle();

            if (error) {
              console.error("Error inserting new reading:", error);
              throw error;
            }

            console.log("New reading inserted:", newCompatibilityReading);

            const endpoint =
              compatibilityType === "love"
                ? `${config.api.url}/compatibility/couple`
                : `${config.api.url}/compatibility/friendship`;
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                profile1: profileData,
                profile2: partnerProfile,
                wetonJodoh: wetonJodoh,
                readingId: newCompatibilityReading.id,
              }),
              credentials: "include",
            });

            const readingData = await response.json();
            setCoupleReading(readingData);
            const readingType = getCompatibilitySlug(
              newCompatibilityReading?.slug
            );
            const newSlug = newCompatibilityReading?.slug;
            router.push(
              `/readings/compatibility/${readingType}?slug=${newSlug}`
            );
            // setLoading(false);
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
    if (profileData && user) {
      fetchFriends();
      fetchCustomProfiles();
    }
  }, [profileData]); // Dependencies

  // if (authLoading || loading || (loadingProfile && !error)) {
  //   return <PageLoadingLayout />;
  // }

  if (!profileData && !authLoading && !loading && !loadingProfile) {
    return (
      <NoProfileLayout
        router={router}
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />
    );
  }

  // console.log(customBirthDate, customBirthTime);
  // console.log(selectedPartnerReading);

  return (
    <>
      <Head>
        <title>Compatibility - Wetonscope</title>
        <meta
          name="description"
          content="View your profile details and reading history."
        />
      </Head>

      <div className="h-[100svh] flex flex-col bg-base relative">
        <Navbar title="Compatibility" isConnection={true} isBack={true} />
        {authLoading || loading || (loadingProfile && !error) ? (
          <CompatibilityLoadingSkeleton />
        ) : (
          <div className="flex-grow overflow-y-auto justify-center pt-4 sm:pt-6 pb-20 px-5">
            <div className="flex-col items-center text-center mb-4">
              <div className="text-sm my-5">
                Select a partner to create a compatibility reading and see the
                relationship dynamics.
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
                    {compatibilityType == "love" ? "💖" : "🤝"}
                  </div>
                </div>

                {partnerProfile.id ? (
                  <button
                    onClick={() => setShowPartnerSelectionSheet(true)}
                    className="p-2 flex-col flex items-center w-[45%] "
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {partnerProfile?.full_name.split(" ")[0] ||
                        "Partner Name"}
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
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPartnerSelectionSheet(true)}
                    className="p-2 flex-col flex items-center w-[45%] "
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {partnerProfile?.full_name?.split(" ")[0] ||
                        "Select Partner"}
                    </h3>
                    <div className="avatar">
                      <div className=" size-24 ring-3 ring-offset-2 ring-slate-200 rounded-full bg-slate-200">
                        <div className="flex h-full justify-center items-center">
                          <SmilePlusIcon
                            size={30}
                            className="text-batik-white"
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-5 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex space-y-4 my-6 justify-between flex-col items-center gap-4 w-full">
              {partnerProfile.id && profileData?.weton && (
                <div className="mb-4 w-fit max-w-xs mx-auto justify-center text-center flex relative">
                  <select
                    id="compatibilityType"
                    value={compatibilityType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setCompatibilityType(e.target.value);
                      fetchSelectedPartnerReading(partnerProfile, newType);
                    }}
                    className="w-full text-center rounded-2xl border bg-batik/50 border-batik-border px-4 py-2 pr-10 font-semibold text-batik-black focus:outline-none focus:border-rose-400 appearance-none"
                  >
                    <option value="love">💖 As Romantic Partners</option>
                    <option value="friendship">🤝 As a Friendship</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-batik-black">
                    <ChevronDown size={20} />
                  </span>
                </div>
              )}

              {wetonJodoh.jodoh4 && partnerProfile.id && (
                <>
                  {selectedPartnerReading?.status === "completed" ? (
                    compatibilityType === "love" ? (
                      <LoveCompatibilityCard reading={selectedPartnerReading} />
                    ) : (
                      <FriendshipCompatibilityCard
                        reading={selectedPartnerReading}
                      />
                    )
                  ) : selectedPartnerReading?.status === "loading" ? (
                    <div className="p-5 w-full rounded-2xl border border-slate-300">
                      <AnimatedLoadingText
                        messages={
                          compatibilityType
                            ? coupleLoadingMessages
                            : friendshipLoadingMessages
                        }
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        profileData?.subscription == "pro"
                          ? handleCoupleReading()
                          : presentPaywall()
                      }
                      className="btn btn-secondary rounded-xl w-full border-rose-500 border disabled:bg-slate-400 mt-20 disabled:cursor-not-allowed"
                      disabled={
                        loading || !wetonJodoh.jodoh4 || !partnerProfile
                      }
                    >
                      {loading && coupleReading.length === 0
                        ? "Generating..."
                        : "Get Compatibility Reading"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <Menubar page={"compatibility"} />

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
                          calculateWetonJodoh(partner);
                          setShowPartnerSelectionSheet(false);
                          setPartnerSearchTerm("");
                          fetchSelectedPartnerReading(
                            partner,
                            compatibilityType
                          );
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
                    onClick={() =>
                      profileData?.subscription == "pro"
                        ? setShowCustomPartnerForm(true)
                        : presentPaywall()
                    }
                    className="btn btn-outline w-full rounded-2xl max-w-md border-slate-200 py-2.5 font-semibold text-slate-600"
                    disabled={isProcessing}
                  >
                    <span className="mr-1">🎭</span>
                    Add Custom Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    {!showBirthTimeChecker && (
                      <input
                        type="time"
                        id="customBirthTime"
                        value={customBirthTime}
                        onChange={(e) => setCustomBirthTime(e.target.value)}
                        className="w-full px-3 py-2 font-semibold border-2 border-batik/70 text-base rounded-2xl focus:border-batik-border-light focus:border-2 bg-batik/70 appearance-none focus:outline-hidden"
                        required
                      />
                    )}
                    {/* Checkbox for "I don't know my birth time" */}
                    <div className="mt-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          className="checkbox checkbox-xs border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                          type="checkbox"
                          checked={showBirthTimeChecker === true}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShowBirthTimeChecker(true);
                              setCustomBirthTime("06:00"); // Default to "I don't know" option
                            } else {
                              setShowBirthTimeChecker(false);
                              setCustomBirthTime(""); // Reset time input
                            }
                          }}
                        />
                        I don't know
                      </label>
                    </div>

                    {/* If user doesn't know birth time, show options */}
                    {showBirthTimeChecker && (
                      <div className="mt-2">
                        <label className="block text-sm text-gray-700 mb-1">
                          Choose one:
                        </label>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              className="radio radio-xs border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                              type="radio"
                              name="unknownBirthTime"
                              value="06:00"
                              checked={customBirthTime === "06:00"}
                              onChange={() => setCustomBirthTime("06:00")}
                            />
                            I don't know
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              className="radio radio-xs border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                              type="radio"
                              name="unknownBirthTime"
                              value="12:00"
                              checked={customBirthTime === "12:00"}
                              onChange={() => setCustomBirthTime("12:00")}
                            />
                            Before 6 PM
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              className="radio radio-xs border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                              type="radio"
                              name="unknownBirthTime"
                              value="20:00"
                              checked={customBirthTime === "20:00"}
                              onChange={() => setCustomBirthTime("20:00")}
                            />
                            After 6 PM
                          </label>
                        </div>
                      </div>
                    )}
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
                  className="w-full rounded-2xl max-w-md bg-rose-400 py-2.5 font-semibold text-white mb-3 disabled:bg-slate-200"
                  disabled={savingCustomPartner}
                >
                  {savingCustomPartner ? "Saving..." : "Save Custom Partner"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
