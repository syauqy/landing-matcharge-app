import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useQueryState } from "nuqs";
import { Navbar } from "@/components/layouts/navbar";
import { LoveCompatibilityCard } from "@/components/readings/love-compatibility-card";
import clsx from "clsx";
import {
  SunIcon,
  MoonStarIcon,
  UserPlus,
  UserCheck,
  UserX,
  Loader2,
  LockIcon,
} from "lucide-react";

function DetailProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get current logged-in user
  const [activeTab, setActiveTab] = useState("weton");
  const [username, setUsername] = useQueryState("username");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serializedInsight, setSerializedInsight] = useState(null);
  const [loadingSerializedInsight, setLoadingSerializedInsight] =
    useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(null); // 'not_friends', 'pending_sent', 'pending_received', 'friends', null (loading)
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false);
  const [friendshipError, setFriendshipError] = useState("");
  const [compatibilityReadingData, setCompatibilityReadingData] =
    useState(null);
  const [loadingCompatibilityReading, setLoadingCompatibilityReading] =
    useState(false);

  const fetchProfile = useCallback(async () => {
    if (!username) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, full_name, dina_pasaran, weton, wuku, avatar_url"
        )
        .eq("username", username)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  //friendship check
  useEffect(() => {
    if (!user || !profile || user.id === profile.id) {
      // Don't fetch if no logged-in user, no profile, or viewing own profile
      setFriendshipStatus(null); // Or 'self' if you want to indicate it's the user's own profile
      setCompatibilityReadingData(null);
      return;
    }

    const fetchStatus = async () => {
      setIsFriendActionLoading(true);
      setFriendshipError("");
      try {
        // Check if a friendship record exists
        const { data, error } = await supabase
          .from("friendships")
          .select("requester_id, addressee_id, status")
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`
          )
          .maybeSingle(); // Use maybeSingle as there might be no record

        if (error) throw error;

        if (data) {
          if (data.status === "accepted") {
            setFriendshipStatus("friends");
          } else if (data.status === "pending") {
            if (data.requester_id === user.id) {
              setFriendshipStatus("pending_sent");
            } else {
              setFriendshipStatus("pending_received");
            }
            setCompatibilityReadingData(null); // Reset if status changes from friends
          }
        } else {
          setFriendshipStatus("not_friends");
        }
      } catch (err) {
        console.error("Error fetching friendship status:", err);
        setFriendshipError("Could not load friendship status.");
        setFriendshipStatus("not_friends"); // Fallback
      } finally {
        setIsFriendActionLoading(false);
      }
    };

    fetchStatus();
  }, [user, profile, router]);

  //compatibility check
  useEffect(() => {
    const fetchCompatibilityReading = async () => {
      if (friendshipStatus !== "friends" || !user || !profile) {
        setCompatibilityReadingData(null);
        setLoadingCompatibilityReading(false);
        return;
      }
      setLoadingCompatibilityReading(true);
      let loggedInUsername = null;
      try {
        const { data: loggedInUserData, error: loggedInUserError } =
          await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

        if (loggedInUserError) {
          console.error(
            "Error fetching logged-in user's username:",
            loggedInUserError
          );
          throw loggedInUserError;
        }
        if (!loggedInUserData || !loggedInUserData.username) {
          console.error("Logged-in user's username not found.");
          setCompatibilityReadingData(null);
          setLoadingCompatibilityReading(false);
          return;
        }

        loggedInUsername = loggedInUserData.username;

        const slug1Base = `${loggedInUsername}-${profile.username}`;
        const slug2Base = `${profile.username}-${loggedInUsername}`;

        const orConditions = [
          `and(user_id.eq.${user.id},or(slug.eq.${slug1Base}-friendship,slug.eq.${slug1Base}-couple))`,
          `and(user_id.eq.${profile.id},or(slug.eq.${slug2Base}-friendship,slug.eq.${slug2Base}-couple))`,
        ].join(",");

        // console.log(user);
        // console.log(orConditions);

        const { data, error } = await supabase
          .from("readings")
          .select("reading, created_at, slug, title, reading_category, status")
          .eq("reading_category", "compatibility")
          .or(orConditions)
          .order("created_at", { ascending: false })
          .maybeSingle();

        if (error) throw error;
        setCompatibilityReadingData(data);
      } catch (err) {
        console.error("Error fetching compatibility reading:", err);
        // Optionally set an error state for compatibility reading
      } finally {
        setLoadingCompatibilityReading(false);
      }
    };

    if (friendshipStatus === "friends") {
      fetchCompatibilityReading();
    } else {
      setCompatibilityReadingData(null); // Clear if not friends
    }
  }, [friendshipStatus, user, profile]);

  const handleFriendAction = async () => {
    if (!user || !profile || user.id === profile.id || isFriendActionLoading)
      return;

    setIsFriendActionLoading(true);
    setFriendshipError("");

    try {
      if (friendshipStatus === "not_friends") {
        // Send friend request
        const { error } = await supabase.from("friendships").insert({
          requester_id: user.id,
          addressee_id: profile.id,
          status: "pending",
        });
        if (error) throw error;
        setFriendshipStatus("pending_sent");
      } else if (friendshipStatus === "pending_received") {
        // Accept friend request
        const { error } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .match({
            requester_id: profile.id,
            addressee_id: user.id,
            status: "pending",
          });
        if (error) throw error;
        setFriendshipStatus("friends");
      } else if (
        friendshipStatus === "pending_sent" ||
        friendshipStatus === "friends"
      ) {
        // Cancel sent request or Remove friend
        const { error } = await supabase
          .from("friendships")
          .delete()
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`
          );
        if (error) throw error;
        setFriendshipStatus("not_friends");
      }
    } catch (err) {
      console.error("Error performing friend action:", err);
      setFriendshipError(
        `Failed to ${
          friendshipStatus === "not_friends"
            ? "send request"
            : friendshipStatus === "pending_received"
            ? "accept request"
            : "update friendship"
        }. Please try again.`
      );
    } finally {
      setIsFriendActionLoading(false);
    }
  };

  const canViewDetails =
    (user && profile && user.id === profile.id) ||
    friendshipStatus === "friends";

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-batik-border"></div>
      </div>
    );
  }

  if (user.id && !loading && !authLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Profile not found
          </h2>
          <p className="text-gray-500 mt-2">
            The requested profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  console.log(profile);

  // Avatar logic: use profile.avatar_url or generate with ui-avatars
  const displayAvatarUrl =
    profile.avatar_url ||
    (profile.full_name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
          profile.full_name
        )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          profile.username
        )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`); // Fallback to username if no full_name

  return (
    <>
      <Head>
        <title>{`${
          profile.full_name || profile.username
        }'s Profile - Wetonscope`}</title>
        <meta
          name="description"
          content={`View the Weton and Wuku details for ${
            profile.full_name || profile.username
          }.`}
        />
      </Head>

      <div className="h-[100svh] flex flex-col bg-base relative">
        <Navbar title={profile.full_name} isBack={true} />
        <div className="flex-grow overflow-y-auto overflow-x-clip pt-4 sm:pt-6 pb-20">
          {/* Profile Header */}
          <div className="px-5 mb-6 flex items-center gap-4">
            <div className="avatar">
              <div className="w-16 rounded-full ring-3 ring-offset-2 ring-batik-border">
                <img
                  src={displayAvatarUrl}
                  alt={`${profile.full_name || profile.username}'s avatar`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 max-w-[80%]">
              <div className="flex flex-col">
                <div className="text-xl font-bold text-batik-black overflow-x-clip text-nowrap text-ellipsis">
                  {profile?.full_name || "Full Name"}
                </div>
                <div className="leading-3 text-sm text-gray-500 overflow-x-clip text-nowrap text-ellipsis">
                  {profile?.username || "username"}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <SunIcon size={12} />
                  {profile?.weton?.laku?.name}
                </div>
                <>&bull;</>
                <div className="flex items-center gap-1">
                  <MoonStarIcon size={12} />
                  {profile?.wuku?.name}
                </div>
              </div>
              {/* <Link
                href="/connections"
                className="py-1.5 px-3 text-xs inline-flex items-center w-fit rounded-full border text-batik-text border-batik-text hover:bg-batik/80 hover:cursor-pointer"
              >
                <Users2Icon size={13} className=" mr-2" />
                <span>View Connections</span>
              </Link> */}
            </div>
          </div>

          {/* Friend Action Button & Error Message */}
          {user && profile && user.id !== profile.id && !authLoading && (
            <div className="px-5 mb-4">
              {friendshipError && (
                <p className="text-sm text-red-500 mb-2">{friendshipError}</p>
              )}
              <div
                className={clsx(
                  "grid items-center w-full",
                  friendshipStatus == "friends"
                    ? "grid-cols-2 gap-2"
                    : "grid-cols-1"
                )}
              >
                {friendshipStatus === "friends" &&
                  !compatibilityReadingData && (
                    <Link
                      href="/compatibility"
                      className="btn rounded-2xl w-full bg-batik/50 border-batik-border text-batik-black"
                    >
                      Get Compatibility
                    </Link>
                  )}
                <button
                  onClick={handleFriendAction}
                  disabled={isFriendActionLoading || !friendshipStatus}
                  className={`btn rounded-2xl ${
                    friendshipStatus === "friends"
                      ? "border-red-500 text-red-600 bg-red-100" // Option to remove friend
                      : friendshipStatus === "pending_sent"
                      ? "bg-red-100 border-red-500 text-red-600" // Option to cancel request
                      : friendshipStatus === "pending_received"
                      ? "bg-green-100 border-green-500 text-green-600" // Option to accept
                      : "bg-batik border-batik-border" // Option to add friend
                  } flex items-center justify-center gap-2`}
                >
                  {isFriendActionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : friendshipStatus === "friends" ? (
                    <>
                      <UserX size={18} /> Remove Friend
                    </>
                  ) : friendshipStatus === "pending_sent" ? (
                    <>
                      <UserX size={18} /> Cancel Request
                    </>
                  ) : friendshipStatus === "pending_received" ? (
                    <>
                      <UserCheck size={18} /> Accept Request
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} /> Add Friend
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bio Section */}
          {profile.bio && (
            <div className="px-5 mb-6">
              <p className="text-sm text-gray-700">{profile.bio}</p>
            </div>
          )}

          {/* Compatibility Reading Section */}
          {canViewDetails && loadingCompatibilityReading && (
            <div className="px-5 mb-6 text-center">
              <Loader2
                size={24}
                className="animate-spin mx-auto text-batik-black"
              />
              <p className="text-sm text-gray-500 mt-2">
                Loading compatibility insights...
              </p>
            </div>
          )}
          {canViewDetails &&
            compatibilityReadingData &&
            compatibilityReadingData.status === "completed" && (
              <div className="px-5 mb-6">
                <LoveCompatibilityCard reading={compatibilityReadingData} />
              </div>
            )}
          {canViewDetails &&
            compatibilityReadingData &&
            compatibilityReadingData.status === "pending" && (
              <div className="px-5 mb-6 text-center">
                <Loader2
                  size={24}
                  className="animate-spin mx-auto text-batik-black"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Compatibility reading is being generated...
                </p>
              </div>
            )}

          {/* Tabs */}
          {canViewDetails ? (
            <div className="px-5">
              <div className="mb-4 border-2 rounded-2xl border-gray-100 bg-gray-100">
                <nav className="grid grid-cols-2" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("weton")}
                    className={`${
                      activeTab === "weton"
                        ? "border-batik-text text-batik-black bg-batik-border font-semibold"
                        : "border-transparent text-gray-500 hover:text-batik-text hover:border-batik-text"
                    } whitespace-nowrap py-2 px-4 rounded-2xl font-medium text-sm`}
                  >
                    Weton
                  </button>
                  <button
                    onClick={() => setActiveTab("wuku")}
                    className={`${
                      activeTab === "wuku"
                        ? "border-batik-text text-batik-black bg-batik-border font-semibold"
                        : "border-transparent text-gray-500 hover:text-batik-text hover:border-batik-text"
                    } whitespace-nowrap py-2 px-4 rounded-2xl font-medium text-sm`}
                  >
                    Wuku
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === "weton" &&
                  profile.weton && ( // Check if weton data exists
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-row gap-y-4 text-sm">
                        <div className="flex flex-col border-y border-l border-batik-border rounded-l-xl">
                          {/* <div className="border-b border-batik-border px-4 py-2">
                            Weton
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Day (Dina)
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Market Day (Pasaran)
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Total Neptu
                          </div> */}
                          <div className="border-b border-batik-border px-4 py-2">
                            Laku
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Pancasuda
                          </div>
                          <div className="px-4 py-2">Rakam</div>
                        </div>
                        <div className="flex flex-col border flex-grow border-batik-border rounded-r-xl font-medium text-batik-black">
                          {/* <Link
                            href="#weton"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profile.weton?.weton_en}
                          </Link>
                          <Link
                            href="#dina"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profile.weton?.dina_en}
                          </Link>
                          <Link
                            href="#pasaran"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profile.weton?.pasaran}
                          </Link>
                          <Link
                            href="#weton"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profile.weton?.total_neptu}
                          </Link> */}
                          <Link
                            href="#laku"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profile.weton?.laku?.name}
                          </Link>
                          <Link
                            href="#pancasuda"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profile.weton?.saptawara?.name}
                          </Link>
                          <Link href="#rakam" className="px-4 p-2">
                            {profile.weton?.rakam?.name}
                          </Link>
                        </div>
                      </div>
                      <div className="bg-base-100 rounded-2xl p-4 md:p-6 mb-6 border border-[var(--color-batik-border)]">
                        <div className="space-y-4 text-sm">
                          {/* {(profile.weton?.dina_en ||
                            profile.weton?.day_character?.description) && (
                            <div id="dina" className="flex flex-col gap-1">
                              <div className="text-sm font-semibold  text-batik-text">
                                Day (Dina)
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profile.weton?.dina_en}
                                </div>
                                <div className="text-base text-gray-700">
                                  {profile.weton?.day_character?.description}
                                </div>
                              </div>
                            </div>
                          )}

                          {(profile.weton?.pasaran ||
                            profile.weton?.pasaran_character?.description) && (
                            <div
                              id="pasaran"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Market Day (Pasaran)
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profile.weton?.pasaran}
                                </div>
                                <div className="text-base text-gray-700">
                                  {
                                    profile.weton?.pasaran_character
                                      ?.description
                                  }
                                </div>
                              </div>
                            </div>
                          )} */}

                          {profile.weton?.watak_weton && (
                            <div
                              id="weton"
                              className="flex flex-col gap-1 pt-4"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Archetype
                              </div>
                              <div className="flex flex-col gap-3">
                                <div className="text-lg font-semibold">
                                  {profile.weton.watak_weton.archetype}
                                </div>
                                <div className="flex flex-col">
                                  <div className="text-sm font-semibold text-batik-text/70">
                                    Vibe
                                  </div>
                                  <div className="text-base text-gray-700">
                                    {profile.weton.watak_weton.vibe}
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <div className="text-sm font-semibold text-batik-text/70">
                                    Green Flags
                                  </div>
                                  <div className="text-base text-gray-700">
                                    {profile.weton.watak_weton.green_flags}
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <div className="text-sm font-semibold text-batik-text/70">
                                    Potential Challenges
                                  </div>
                                  <div className="text-base text-gray-700">
                                    {
                                      profile.weton.watak_weton
                                        .potential_challenges
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {profile.weton?.neptu_character?.description && (
                            <div
                              id="weton"
                              className="flex flex-col gap-1 pt-4"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Characters and Traits
                              </div>
                              <div>
                                <div className="text-base text-gray-700">
                                  {profile.weton?.neptu_character?.description}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Laku */}
                          {profile.weton?.laku && (
                            <div
                              id="laku"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Laku
                              </div>
                              <div className="flex flex-col gap-2">
                                <div>
                                  <div className="text-lg font-semibold">
                                    {profile.weton.laku.name}
                                  </div>
                                  <div className="text-sm font-light text-slate-700">
                                    {profile.weton.laku.meaning}
                                  </div>
                                </div>
                                <div className="text-base text-gray-700">
                                  {profile.weton.laku.description}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Pancasuda (Saptawara) */}
                          {profile.weton?.saptawara && (
                            <div
                              id="pancasuda"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Pancasuda
                              </div>
                              <div className="flex flex-col gap-2">
                                <div>
                                  <div className="text-lg font-semibold">
                                    {profile.weton.saptawara.name}
                                  </div>
                                  <div className="text-sm font-light text-slate-700">
                                    {profile.weton.saptawara.meaning}
                                  </div>
                                </div>
                                <div className="text-base text-gray-700">
                                  {profile.weton.saptawara.description}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Rakam */}
                          {profile.weton?.rakam && (
                            <div
                              id="rakam"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Rakam
                              </div>
                              <div className="flex flex-col gap-2">
                                <div>
                                  <div className="text-lg font-semibold">
                                    {profile.weton.rakam.name}
                                  </div>
                                  <div className="text-sm font-light text-slate-700">
                                    {profile.weton.rakam.meaning}
                                  </div>
                                </div>
                                <div className="text-base text-gray-700">
                                  {profile.weton.rakam.description}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* {profile.weton?.sadwara && (
                          <div className="pt-3 mt-3 border-t border-gray-200">
                            <h3 className="font-semibold text-batik-text mb-1">
                              Sadwara: {profile.weton.sadwara.name}
                              {profile.weton.sadwara.meaning &&
                                ` (${profile.weton.sadwara.meaning})`}
                            </h3>
                            <p className="text-gray-700">
                              {profile.weton.sadwara.description}
                            </p>
                          </div>
                        )}

                        {profile.weton?.hastawara && (
                          <div className="pt-3 mt-3 border-t border-gray-200">
                            <h3 className="font-semibold text-batik-text mb-1">
                              Hastawara: {profile.weton.hastawara.name}
                              {profile.weton.hastawara.meaning &&
                                ` (${profile.weton.hastawara.meaning})`}
                            </h3>
                            <p className="text-gray-700">
                              {profile.weton.hastawara.description}
                            </p>
                          </div>
                        )} */}
                        </div>
                      </div>
                    </div>
                  )}
                {activeTab === "weton" && !profile.weton && (
                  <p className="text-gray-500">
                    Weton data not available for this user.
                  </p>
                )}

                {activeTab === "wuku" &&
                  profile.wuku && ( // Check if wuku data exists
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-row gap-y-4 text-sm">
                        <div className="flex flex-col border-y border-l border-batik-border rounded-l-xl">
                          <div className="border-b border-batik-border px-4 py-2">
                            Wuku
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Guardian Deity
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Tree
                          </div>
                          <div className="px-4 py-2">Bird</div>
                        </div>
                        <div className="flex flex-col border flex-grow border-batik-border rounded-r-xl font-medium text-batik-black">
                          <Link
                            href="#wuku"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profile.wuku?.name}
                          </Link>
                          <Link
                            href="#god"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profile.wuku.god}
                          </Link>
                          <Link
                            href="#tree"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profile.wuku.tree}
                          </Link>
                          <Link href="#bird" className="px-4 py-2">
                            {profile.wuku.bird}
                          </Link>
                        </div>
                      </div>
                      <div className="bg-base-100 rounded-2xl p-4 md:p-6 mb-6 border border-[var(--color-batik-border)]">
                        <div className="space-y-4 text-sm">
                          {profile?.wuku?.character && (
                            <div id="wuku" className="flex flex-col gap-1">
                              <div className="text-sm font-semibold  text-batik-text">
                                Wuku
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profile?.wuku?.name}
                                </div>
                                <div className="text-base text-gray-700">
                                  {profile?.wuku?.character}
                                </div>
                              </div>
                            </div>
                          )}
                          {profile?.wuku?.god && (
                            <div
                              id="god"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Guardian Deity
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profile?.wuku?.god}
                                </div>
                                <div className="text-base text-gray-700">
                                  {profile.wuku.god_meaning}
                                </div>
                              </div>
                            </div>
                          )}
                          {profile?.wuku?.tree && (
                            <div
                              id="tree"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Tree
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profile?.wuku?.tree}
                                </div>
                                <div className="text-base text-gray-700">
                                  {profile.wuku.tree_meaning}
                                </div>
                              </div>
                            </div>
                          )}
                          {profile?.wuku?.bird && (
                            <div
                              id="bird"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Bird
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profile?.wuku?.bird}
                                </div>
                                <div className="text-base text-gray-700">
                                  {profile.wuku.bird_meaning}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                {activeTab === "wuku" && !profile.wuku && (
                  <p className="text-gray-500">
                    Wuku data not available for this user.
                  </p>
                )}
              </div>
            </div>
          ) : (
            user &&
            profile &&
            user.id !== profile.id &&
            (friendshipStatus === "not_friends" ||
              friendshipStatus === "pending_sent" ||
              friendshipStatus === "pending_received") && (
              <div className="px-5 mb-6 text-center">
                <div className="p-4 bg-batik/50 border border-batik-border rounded-2xl">
                  <LockIcon
                    size={32}
                    className="mx-auto mb-2 text-batik-text"
                  />{" "}
                  {/* Placeholder Icon */}
                  <h3 className="font-semibold text-batik-black">
                    Profile Locked
                  </h3>
                  <p className="text-sm text-batik-black mt-1">
                    Only connections can see their full profile details.
                  </p>
                  {friendshipStatus === "pending_received" ? (
                    <p className="text-xs text-gray-500 mt-2">
                      Accept the friend request to view more.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      Send a friend request to view more.
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
        {/* Menubar: Consider if 'page' prop needs adjustment for public profiles */}
        {/* <Menubar page={"profile"} /> */}
      </div>
    </>
  );
}

// export async function getServerSideProps(context) {
//   const { slug } = context.params;

//   if (!slug || typeof slug !== "string" || slug.trim() === "") {
//     return { notFound: true }; // Invalid slug
//   }

//   // Fetch profile data from Supabase 'profiles' table
//   // Assumes your 'profiles' table has a 'username' column that matches the slug
//   const { data: profile, error } = await supabase
//     .from("profiles")
//     .select("id, username, full_name, dina_pasaran, weton, wuku") // Added id, avatar_url, bio
//     .eq("username", slug) // Match the username column with the slug
//     .single(); // Expect a single record

//   if (error) {
//     // .single() throws an error if 0 or >1 rows are found.
//     // This typically means the profile was not found or there's a data integrity issue (e.g. duplicate usernames).
//     console.error(
//       `Supabase error fetching profile for slug "${slug}":`,
//       error.message
//     );
//     return { notFound: true }; // Triggers a 404 page
//   }

//   // Although .single() should error if no profile is found,
//   // this is an extra check.
//   if (!profile) {
//     console.warn(
//       `Profile data unexpectedly null for slug "${slug}" despite no Supabase error.`
//     );
//     return { notFound: true };
//   }

//   return {
//     props: {
//       profile,
//     },
//   };
// }

export default DetailProfilePage;
