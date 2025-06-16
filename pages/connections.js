import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layouts/navbar";
import { NavbarDetail } from "@/components/layouts/navbar-detail";
import { Menubar } from "@/components/layouts/menubar";
import Link from "next/link";
import { UserPlus, UserCheck, UserX, Search, Loader2 } from "lucide-react";

export default function ConnectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [error, setError] = useState(null);

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
            full_name
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
          profile_requester:requester_id (id, username, full_name),
          profile_addressee:addressee_id (id, username, full_name)
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

  useEffect(() => {
    if (user) {
      fetchPendingRequests();
      fetchFriends();
    }
  }, [user, fetchPendingRequests, fetchFriends]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    setError(null);
    try {
      const { data, error: searchError } = await supabase
        .from("profiles")
        .select("id, username, full_name")
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
    }
  };

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
                className="input input-bordered input-sm w-full"
              />
              <button
                type="submit"
                className="btn btn-sm btn-primary"
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
                <div
                  key={profile.id}
                  className="p-3 bg-base-100 rounded-lg shadow border border-batik-border flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-batik-black">
                      {profile.full_name || profile.username}
                    </p>
                    <p className="text-xs text-gray-500">@{profile.username}</p>
                  </div>
                  <Link
                    href={`/profile/${profile.username}`}
                    className="btn btn-xs btn-outline btn-primary"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
              {!loadingSearch &&
                searchTerm !== "" &&
                searchResults.length === 0 && (
                  <p className="text-sm text-gray-500">No users found.</p>
                )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-batik-black mb-3">
              Requests ({pendingRequests.length})
            </h2>
            {loadingRequests && (
              <p className="text-sm text-gray-500">Loading requests...</p>
            )}
            <div className="space-y-2">
              {pendingRequests.length > 0
                ? pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 bg-base-100 rounded-lg shadow border border-batik-border flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-batik-black">
                          {req.profiles?.full_name || req.profiles?.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{req.profiles?.username}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleFriendRequestAction(req.id, "decline")
                          }
                          className="btn btn-xs btn-error"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() =>
                            handleFriendRequestAction(req.id, "accept")
                          }
                          className="btn btn-xs btn-success"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))
                : !loadingRequests && (
                    <p className="text-sm text-gray-500">
                      No pending requests.
                    </p>
                  )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-batik-black mb-3">
              Your Friends ({friends.length})
            </h2>
            {loadingFriends && (
              <p className="text-sm text-gray-500">Loading friends...</p>
            )}
            <div className="space-y-2">
              {friends.length > 0
                ? friends.map((friend) => (
                    <Link
                      key={friend.id}
                      href={`/profile/${friend.username}`}
                      className="block p-3 bg-base-100 rounded-lg shadow border border-batik-border hover:bg-base-200 transition-colors"
                    >
                      <p className="font-semibold text-batik-black">
                        {friend.full_name || friend.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{friend.username}
                      </p>
                    </Link>
                  ))
                : !loadingFriends && (
                    <p className="text-sm text-gray-500">
                      You have no friends yet. Try searching for some!
                    </p>
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
