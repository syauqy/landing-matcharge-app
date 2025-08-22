import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layouts/navbar";
import { Menubar } from "@/components/layouts/menubar";
import Link from "next/link";
import { Loader2, SunIcon, MoonStarIcon } from "lucide-react";

export default function ConnectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingDone, setSearchingDone] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [error, setError] = useState(null);
  const [customProfiles, setCustomProfiles] = useState([]);
  const [loadingCustomProfiles, setLoadingCustomProfiles] = useState(true);

  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;
    setLoadingRequests(true);
    setError(null);
    try {
      const { data, error: reqError } = await supabase
        .from("friendships")
        .select(
          `
          id,
          requester_id,
          status,
          created_at,
          profiles: requester_id (
            id,
            username,
            full_name,
            dina_pasaran, wuku->name, weton->laku
          )
        `
        )
        .eq("addressee_id", user.id)
        .eq("status", "pending");

      if (reqError) throw reqError;
      setPendingRequests(data || []);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      setError("Failed to load pending requests.");
    } finally {
      setLoadingRequests(false);
    }
  }, [user]);

  const fetchFriends = useCallback(async () => {
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
          status,
          profile_requester:requester_id (id, username, full_name, dina_pasaran, wuku->name, avatar_url, weton->laku),
          profile_addressee:addressee_id (id, username, full_name, dina_pasaran, wuku->name, avatar_url, weton->laku)
        `
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (friendsError) throw friendsError;

      const friendProfiles = data.map((friendship) => {
        return friendship.requester_id === user.id
          ? friendship.profile_addressee
          : friendship.profile_requester;
      });
      setFriends(friendProfiles.filter(Boolean) || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setError("Failed to load friends list.");
    } finally {
      setLoadingFriends(false);
    }
  }, [user]);

  const fetchCustomProfiles = useCallback(async () => {
    if (!user) return;
    setLoadingFriends(true);
    setError(null);
    try {
      const { data, error: customProfilesError } = await supabase
        .from("custom_profiles")
        .select(`id, gender, username, full_name, weton->laku, wuku->name`)
        .eq("user_id", user.id);

      if (customProfilesError) throw customProfilesError;
      setCustomProfiles(data || []);
    } catch (err) {
      console.error("Error fetching custom profiles:", err);
      setError("Failed to load custom profiles.");
    } finally {
      setLoadingCustomProfiles(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPendingRequests();
      fetchFriends();
      fetchCustomProfiles();
    }
  }, [user, fetchPendingRequests, fetchFriends, fetchCustomProfiles]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchingDone(false);
    setLoadingSearch(true);
    setError(null);
    try {
      const { data, error: searchError } = await supabase
        .from("profiles")
        .select(
          "id, username, full_name, dina_pasaran, wuku->name, avatar_url, weton->laku"
        )
        .ilike("username", `%${searchTerm}%`)
        .neq("id", user?.id || "") // Exclude current user from search
        .limit(10);

      if (searchError) throw searchError;
      setSearchResults(data || []);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users.");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
      setSearchingDone(true);
    }
  };

  // console.log(customProfiles);

  const handleFriendRequestAction = async (requestId, action) => {
    if (!user) return;
    setError(null);
    try {
      if (action === "accept") {
        const { error: updateError } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("id", requestId)
          .eq("addressee_id", user.id);
        if (updateError) throw updateError;
      } else if (action === "decline") {
        const { error: deleteError } = await supabase
          .from("friendships")
          .delete()
          .eq("id", requestId)
          .eq("addressee_id", user.id);
        if (deleteError) throw deleteError;
      }
      fetchPendingRequests();
      fetchFriends();
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
      setError(`Failed to ${action} request.`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <Loader2 className="animate-spin h-8 w-8 text-batik-black" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base">
        <p className="text-batik-black">Please log in to view connections.</p>
        <Link href="/login" className="btn btn-primary mt-4">
          Login
        </Link>
      </div>
    );
  }

  // console.log(friends);

  return (
    <>
      <Head>
        <title>Connections - Wetonscope</title>
      </Head>
      <div className="h-[100svh] flex flex-col bg-base relative">
        <Navbar title="Connections" isBack={true} />
        <div className="flex-grow overflow-y-auto pt-4 sm:pt-6 pb-20 px-5 space-y-8">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <section>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search people by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:outline-0 appearance-none border border-batik-text p-2 rounded-xl w-full"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-batik text-batik-text border-batik-text border font-semibold p-2"
                disabled={loadingSearch}
              >
                {loadingSearch ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <div>Search</div>
                )}
              </button>
            </form>
            {loadingSearch && (
              <p className="text-sm text-gray-500">Searching...</p>
            )}
            <div className="space-y-2">
              {searchResults.map((profile) => (
                <Link
                  href={`/profile/detail?username=${profile.username}`}
                  key={profile.id}
                  className="flex-row gap-3 p-3 bg-base-100 rounded-2xl shadow-xs border border-batik-border flex items-center"
                >
                  <div className="avatar">
                    <div className="w-12 rounded-full ring-batik-border">
                      <img
                        src={
                          profile?.avatar_url
                            ? profile?.avatar_url
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                profile.full_name
                              )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`
                        }
                        alt={profile.full_name}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 max-w-[80%]">
                    <div className="flex flex-row gap-2 items-end leading-4">
                      <p className="font-semibold text-batik-black text-ellipsis overflow-hidden text-nowrap">
                        {profile.full_name || profile.username}
                      </p>
                      <p className="text-xs text-gray-500 leading-3.5 text-ellipsis overflow-hidden text-nowrap">
                        @{profile.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        <SunIcon size={12} />
                        {profile?.laku?.name}
                      </div>
                      <>&bull;</>
                      <div className="flex items-center gap-1">
                        <MoonStarIcon size={12} />
                        {profile?.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {!loadingSearch &&
                searchTerm !== "" &&
                searchingDone &&
                searchResults.length === 0 && (
                  <p className="text-sm text-gray-500">No users found.</p>
                )}
            </div>
          </section>

          {pendingRequests?.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-batik-black mb-3">
                Connection Requests
              </h2>
              {loadingRequests && (
                <p className="text-sm text-gray-500">Loading requests...</p>
              )}
              <div className="space-y-2">
                {pendingRequests.length > 0
                  ? pendingRequests.map((req) => (
                      <Link
                        href={`/profile/detail?username=${req?.profiles?.username}`}
                        key={req?.profiles?.id}
                        className="flex-row gap-3 p-3 bg-base-100 rounded-2xl shadow-xs border border-batik-border flex items-center justify-between"
                      >
                        <div className="flex flex-col gap-1 max-w-[55%]">
                          <div className="flex flex-row gap-2 items-center leading-4">
                            <p className="font-semibold text-batik-black overflow-hidden text-nowrap text-ellipsis">
                              {req?.profiles?.full_name ||
                                req?.profiles?.username}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 overflow-hidden text-nowrap text-ellipsis">
                            @{req?.profiles?.username}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center shrink-0">
                          <button
                            onClick={() =>
                              handleFriendRequestAction(req.id, "decline")
                            }
                            className="btn bg-red-200 p-2 text-xs text-red-600 rounded-xl"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() =>
                              handleFriendRequestAction(req.id, "accept")
                            }
                            className="btn bg-green-200 p-2 text-xs text-green-700 rounded-xl"
                          >
                            Accept
                          </button>
                        </div>
                      </Link>
                    ))
                  : !loadingRequests && (
                      <p className="text-sm text-gray-500">
                        No pending requests.
                      </p>
                    )}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-batik-black mb-3">
              Your Connections
            </h2>
            {loadingFriends ||
              (loadingCustomProfiles && (
                <p className="text-sm text-gray-500">Loading friends...</p>
              ))}
            <div className="space-y-2">
              {friends.length > 0
                ? friends.map((friend) => (
                    <Link
                      key={friend.id}
                      href={`/profile/detail?username=${friend.username}`}
                      className="flex flex-row items-center gap-3 p-3 bg-base-100 rounded-2xl shadow-xs border border-batik-border hover:bg-batik/50 transition-colors"
                    >
                      <div className="avatar">
                        <div className="w-12 rounded-full ring-batik-border">
                          <img
                            src={
                              friend?.avatar_url
                                ? friend?.avatar_url
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    friend.full_name
                                  )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`
                            }
                            alt={friend.full_name}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 max-w-[80%]">
                        <div className="flex flex-row gap-2 items-end leading-4">
                          <p className="font-semibold text-batik-black text-ellipsis overflow-hidden text-nowrap">
                            {friend.full_name || friend.username}
                          </p>
                          <p className="text-xs text-gray-500 leading-3.5 text-ellipsis overflow-hidden text-nowrap">
                            @{friend.username}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <SunIcon size={12} />
                            {friend?.laku?.name}
                          </div>
                          <>&bull;</>
                          <div className="flex items-center gap-1">
                            <MoonStarIcon size={12} />
                            {friend?.name}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                : !loadingFriends &&
                  !customProfiles && (
                    <p className="text-sm text-gray-500">
                      You have no connections yet. Try searching using the
                      search bar above.
                    </p>
                  )}
            </div>
            <div className="space-y-2 mt-2">
              {customProfiles?.length > 0 ? (
                customProfiles.map((customProfile) => (
                  <Link
                    key={customProfile.id}
                    href={`/profile/detail?username=${customProfile.username}&type=custom`}
                    className="relative flex flex-row items-center gap-3 p-3 bg-base-100 rounded-2xl shadow-xs border border-batik-border hover:bg-batik/50 transition-colors"
                  >
                    <div className="avatar">
                      <div className="w-12 rounded-full ring-batik-border">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            customProfile.full_name
                          )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`}
                          alt={customProfile.full_name}
                        />
                      </div>
                    </div>
                    <div className="absolute bg-amber-400 text-batik-black text-xs right-0.5 bottom-1 z-10 px-3 py-1 rounded-2xl font-medium">
                      Custom
                    </div>
                    <div className="flex flex-col gap-2 max-w-[80%]">
                      <div className="flex flex-row gap-2 items-end leading-4 line-clamp-1">
                        <p className="font-semibold text-batik-black text-ellipsis overflow-hidden text-nowrap">
                          {customProfile.full_name || customProfile.username}
                        </p>
                        <p className="text-xs text-gray-500 leading-3.5 text-ellipsis overflow-hidden text-nowrap">
                          @{customProfile.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <SunIcon size={12} />
                          {customProfile?.laku?.name}
                        </div>
                        <>&bull;</>
                        <div className="flex items-center gap-1">
                          <MoonStarIcon size={12} />
                          {customProfile?.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <></>
              )}
            </div>
          </section>
        </div>
        <Menubar page="connections" />{" "}
        {/* Assuming 'connections' is a valid page prop for Menubar */}
      </div>
    </>
  );
}
