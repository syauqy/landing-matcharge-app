import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// Assuming these components are structured similarly to those in profile.js
import { Navbar } from "@/components/layouts/navbar";
import { Menubar } from "@/components/layouts/menubar";
import {
  SunIcon,
  MoonStarIcon,
  UserPlus,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";

// Helper component for displaying profile details neatly (copied from profile.js or shared)
const DetailItem = ({ label, value, isBold = false }) => (
  <div>
    <span className="text-gray-500">{label}:</span>
    <span
      className={`ml-2 ${
        // Removed 'capitalize' to match profile.js DetailItem if it doesn't have it, or add if needed.
        isBold ? "font-semibold text-batik-black" : "text-gray-700"
      }`}
    >
      {value !== null && value !== undefined ? String(value) : "N/A"}
    </span>
  </div>
);

function PublicProfilePage({ profile }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get current logged-in user
  const [activeTab, setActiveTab] = useState("weton");

  const [friendshipStatus, setFriendshipStatus] = useState(null); // 'not_friends', 'pending_sent', 'pending_received', 'friends', null (loading)
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false);
  const [friendshipError, setFriendshipError] = useState("");

  console.log(profile, user);

  useEffect(() => {
    if (!user || !profile || user.id === profile.id) {
      // Don't fetch if no logged-in user, no profile, or viewing own profile
      setFriendshipStatus(null); // Or 'self' if you want to indicate it's the user's own profile
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

  // With getServerSideProps, if notFound: true is returned, Next.js handles the 404 page.
  // This component will only render if 'profile' data is successfully passed.
  if (!profile) {
    // This should ideally not be reached if getServerSideProps is correctly implemented.
    return <p>Profile not found.</p>;
  }

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

  // --- End Friendship Logic ---

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
        <Navbar
          title={`${profile.full_name || profile.username}`}
          isBack={true}
        />
        <div className="flex-grow overflow-y-auto pt-4 sm:pt-6 pb-20">
          {/* Profile Header */}
          <div className="px-5 mb-6 flex items-center gap-4">
            <div className="avatar">
              <div className="w-16 rounded-full">
                <img
                  src={displayAvatarUrl}
                  alt={`${profile.full_name || profile.username}'s avatar`}
                />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-batik-black">
                {profile.full_name || profile.username}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {profile.dina_pasaran && (
                  <div className="flex items-center gap-1">
                    <SunIcon size={12} />
                    {profile.dina_pasaran}
                  </div>
                )}
                {profile.dina_pasaran && profile.wuku?.name && <>&bull;</>}
                {profile.wuku?.name && (
                  <div className="flex items-center gap-1">
                    <MoonStarIcon size={12} />
                    {profile.wuku.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Friend Action Button & Error Message */}
          {user && profile && user.id !== profile.id && !authLoading && (
            <div className="px-5 mb-4">
              {friendshipError && (
                <p className="text-sm text-red-500 mb-2">{friendshipError}</p>
              )}
              <button
                onClick={handleFriendAction}
                disabled={isFriendActionLoading || !friendshipStatus}
                className={`w-full btn btn-sm ${
                  friendshipStatus === "friends"
                    ? "btn-outline btn-error" // Option to remove friend
                    : friendshipStatus === "pending_sent"
                    ? "btn-outline btn-warning" // Option to cancel request
                    : friendshipStatus === "pending_received"
                    ? "btn-success" // Option to accept
                    : "btn-primary" // Option to add friend
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
          )}

          {/* Bio Section */}
          {profile.bio && (
            <div className="px-5 mb-6">
              <p className="text-sm text-gray-700">{profile.bio}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="px-5">
            <div className="mb-4 border-2 rounded-2xl border-gray-100 bg-gray-100">
              <nav className="grid grid-cols-2" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("weton")}
                  className={`${
                    activeTab === "weton"
                      ? "border-batik-text text-white bg-batik-border font-semibold"
                      : "border-transparent text-gray-500 hover:text-batik-text hover:border-batik-text"
                  } whitespace-nowrap py-2 px-4 rounded-2xl font-medium text-sm`}
                >
                  Weton
                </button>
                <button
                  onClick={() => setActiveTab("wuku")}
                  className={`${
                    activeTab === "wuku"
                      ? "border-batik-text text-white bg-batik-border font-semibold"
                      : "border-transparent text-gray-500 hover:text-batik-text hover:border-batik-text"
                  } whitespace-nowrap py-2 px-4 rounded-2xl font-medium text-sm`}
                >
                  Wuku
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-base-100 rounded-lg p-4 md:p-6 mb-6 border border-[var(--color-batik-border)]">
              {activeTab === "weton" &&
                profile.weton && ( // Check if weton data exists
                  <div className="space-y-6 text-sm">
                    <DetailItem label="Dina" value={profile.weton?.dina} />
                    <DetailItem
                      label="Pasaran"
                      value={profile.weton?.pasaran}
                    />
                    <DetailItem
                      label="Neptu Dina"
                      value={profile.weton?.neptu_dina}
                    />
                    <DetailItem
                      label="Neptu Pasaran"
                      value={profile.weton?.neptu_pasaran}
                    />
                    <DetailItem
                      label="Total Neptu"
                      value={profile.weton?.total_neptu}
                      isBold={true}
                    />
                    <DetailItem
                      label="Dina Pasaran"
                      value={profile.dina_pasaran} // from profile root
                    />

                    {(profile.weton?.dina_en ||
                      profile.weton?.day_character?.description) && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Day (Dina): {profile.weton?.dina_en} (
                          {profile.weton?.dina})
                        </h3>
                        <p className="text-gray-700">
                          {profile.weton?.day_character?.description}
                        </p>
                      </div>
                    )}

                    {(profile.weton?.pasaran ||
                      profile.weton?.pasaran_character?.description) && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Market Day (Pasaran): {profile.weton?.pasaran}
                        </h3>
                        <p className="text-gray-700">
                          {profile.weton?.pasaran_character?.description}
                        </p>
                      </div>
                    )}

                    {profile.weton?.neptu_character?.description && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Weton Energy
                        </h3>
                        <p className="text-gray-700">
                          {profile.weton?.neptu_character?.description}
                        </p>
                      </div>
                    )}

                    {/* Laku, Pancasuda, Rakam, Sadwara, Hastawara - similar to profile.js */}
                    {/* Example for Laku, repeat for others if data structure is similar */}
                    {profile.weton?.laku && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Laku: {profile.weton.laku.name}
                          {profile.weton.laku.meaning &&
                            ` (${profile.weton.laku.meaning})`}
                        </h3>
                        <p className="text-gray-700">
                          {profile.weton.laku.description}
                        </p>
                      </div>
                    )}
                    {/* Add other Weton sections (Pancasuda, Rakam, etc.) here, checking for data existence */}
                  </div>
                )}
              {activeTab === "weton" && !profile.weton && (
                <p className="text-gray-500">
                  Weton data not available for this user.
                </p>
              )}

              {activeTab === "wuku" &&
                profile.wuku && ( // Check if wuku data exists
                  <div className="space-y-6 text-sm">
                    <div>
                      <h3 className="font-semibold text-batik-text mb-1">
                        Wuku: {profile.wuku?.name}
                      </h3>
                      {profile.wuku?.character && (
                        <p className="text-gray-700">
                          {profile.wuku.character}
                        </p>
                      )}
                    </div>
                    {/* God, Tree, Bird - similar to profile.js */}
                    {/* Example for God, repeat for others */}
                    {profile.wuku?.god && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h4 className="font-semibold text-batik-text mb-1">
                          Guardian Deity: {profile.wuku.god}
                        </h4>
                        {profile.wuku?.god_meaning && (
                          <p className="text-gray-700">
                            {profile.wuku.god_meaning}
                          </p>
                        )}
                      </div>
                    )}
                    {/* Add other Wuku sections (Tree, Bird) here, checking for data existence */}
                  </div>
                )}
              {activeTab === "wuku" && !profile.wuku && (
                <p className="text-gray-500">
                  Wuku data not available for this user.
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Menubar: Consider if 'page' prop needs adjustment for public profiles */}
        {/* <Menubar page={"profile"} /> */}
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;

  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    return { notFound: true }; // Invalid slug
  }

  // Fetch profile data from Supabase 'profiles' table
  // Assumes your 'profiles' table has a 'username' column that matches the slug
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, dina_pasaran, weton, wuku") // Added id, avatar_url, bio
    .eq("username", slug) // Match the username column with the slug
    .single(); // Expect a single record

  if (error) {
    // .single() throws an error if 0 or >1 rows are found.
    // This typically means the profile was not found or there's a data integrity issue (e.g. duplicate usernames).
    console.error(
      `Supabase error fetching profile for slug "${slug}":`,
      error.message
    );
    return { notFound: true }; // Triggers a 404 page
  }

  // Although .single() should error if no profile is found,
  // this is an extra check.
  if (!profile) {
    console.warn(
      `Profile data unexpectedly null for slug "${slug}" despite no Supabase error.`
    );
    return { notFound: true };
  }

  return {
    props: {
      profile,
    },
  };
}

export default PublicProfilePage;
