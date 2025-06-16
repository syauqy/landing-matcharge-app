// pages/profile.js
import Head from "next/head";
import Image from "next/image"; // Import Next.js Image component for optimization
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link for navigation
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";
import { Navbar } from "@/components/layouts/navbar";
import { NavbarProfile } from "@/components/layouts/navbar-profile";
import { Menubar } from "@/components/layouts/menubar";
import { SunIcon, MoonStarIcon } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState(null);
  const [readingsData, setReadingsData] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("weton");

  // --- Fetch Profile Data ---
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

  // --- Fetch Readings Data ---
  const fetchReadings = async () => {
    if (!user) return;
    setLoadingReadings(true);
    // Keep previous error unless readings fetch causes a new one
    // setError(null);
    try {
      const { data, error: readingsError } = await supabase
        .from("readings")
        .select("id, title, created_at, slug, reading_category") // Select specific fields needed
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10); // Limit the number of readings shown initially

      if (readingsError) throw readingsError;
      setReadingsData(data || []); // Ensure it's an array even if null
    } catch (err) {
      console.error("Error fetching readings:", err);
      setError((prevError) => prevError || "Failed to load readings history."); // Preserve profile error if it exists
    } finally {
      setLoadingReadings(false);
    }
  };

  // --- Auth Effect & Initial Data Fetch ---
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/");
      } else {
        fetchProfile();
        fetchReadings();
      }
    }
  }, [user, authLoading, router]); // Dependencies

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

  console.log(profileData, new Date());

  // --- Generate Avatar URL ---
  const avatarUrl = profileData?.full_name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
        profileData.full_name
      )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true` // Example colors, adjust as needed
    : null; // Handle case where full_name might be missing

  return (
    <>
      <Head>
        <title>My Profile - Wetonscope</title>
        <meta
          name="description"
          content="View your profile details and reading history."
        />
      </Head>

      {/* --- Main Layout Container --- */}
      <div className="h-[100svh] flex flex-col bg-base relative">
        <NavbarProfile title="Profile" />
        <div className="flex-grow overflow-y-auto pt-4 sm:pt-6 pb-20">
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

          {profileData ? (
            <div className="px-5">
              <div className="mb-4 border-2 rounded-2xl border-gray-100 bg-gray-100">
                <nav className="grid grid-cols-3" aria-label="Tabs">
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
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`${
                      activeTab === "settings"
                        ? "border-batik-text text-white bg-batik-border font-semibold"
                        : "border-transparent text-gray-500 hover:text-batik-text hover:border-batik-text"
                    } whitespace-nowrap py-2 px-4 rounded-2xl font-medium text-sm`}
                  >
                    Settings
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="bg-base-100 rounded-lg p-4 md:p-6 mb-6 border border-[var(--color-batik-border)]">
                {activeTab === "weton" && profileData.weton && (
                  <div className="space-y-6 text-sm">
                    <DetailItem label="Dina" value={profileData.weton?.dina} />
                    <DetailItem
                      label="Pasaran"
                      value={profileData.weton?.pasaran}
                    />
                    <DetailItem
                      label="Neptu Dina"
                      value={profileData.weton?.neptu_dina}
                    />
                    <DetailItem
                      label="Neptu Pasaran"
                      value={profileData.weton?.neptu_pasaran}
                    />
                    <DetailItem
                      label="Total Neptu"
                      value={profileData.weton?.total_neptu}
                      isBold={true}
                    />
                    <DetailItem
                      label="Dina Pasaran"
                      value={profileData?.dina_pasaran}
                    />

                    {/* Day (Dina) Character */}
                    {(profileData.weton?.dina_en ||
                      profileData.weton?.day_character?.description) && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Day (Dina): {profileData.weton?.dina_en} (
                          {profileData.weton?.dina})
                        </h3>
                        <p className="text-gray-700">
                          {profileData.weton?.day_character?.description}
                        </p>
                      </div>
                    )}

                    {/* Market Day (Pasaran) Character */}
                    {(profileData.weton?.pasaran ||
                      profileData.weton?.pasaran_character?.description) && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Market Day (Pasaran): {profileData.weton?.pasaran}
                        </h3>
                        <p className="text-gray-700">
                          {profileData.weton?.pasaran_character?.description}
                        </p>
                      </div>
                    )}

                    {/* Weton Energy (Neptu Character) */}
                    {profileData.weton?.neptu_character?.description && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Weton Energy
                        </h3>
                        <p className="text-gray-700">
                          {profileData.weton?.neptu_character?.description}
                        </p>
                      </div>
                    )}

                    {/* Laku */}
                    {profileData.weton?.laku && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Laku: {profileData.weton.laku.name}
                          {profileData.weton.laku.meaning &&
                            ` (${profileData.weton.laku.meaning})`}
                        </h3>
                        <p className="text-gray-700">
                          {profileData.weton.laku.description}
                        </p>
                      </div>
                    )}

                    {/* Pancasuda (Saptawara) */}
                    {profileData.weton?.saptawara && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Pancasuda: {profileData.weton.saptawara.name}
                          {profileData.weton.saptawara.meaning &&
                            ` (${profileData.weton.saptawara.meaning})`}
                        </h3>
                        <p className="text-gray-700">
                          {profileData.weton.saptawara.description}
                        </p>
                      </div>
                    )}

                    {/* Rakam */}
                    {profileData.weton?.rakam && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Rakam: {profileData.weton.rakam.name}
                          {profileData.weton.rakam.meaning &&
                            ` (${profileData.weton.rakam.meaning})`}
                        </h3>
                        <p className="text-gray-700">
                          {profileData.weton.rakam.description}
                        </p>
                      </div>
                    )}

                    {/* Sadwara */}
                    {profileData.weton?.sadwara && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Sadwara: {profileData.weton.sadwara.name}
                          {profileData.weton.sadwara.meaning &&
                            ` (${profileData.weton.sadwara.meaning})`}
                        </h3>
                        <p className="text-gray-700">
                          {profileData.weton.sadwara.description}
                        </p>
                      </div>
                    )}

                    {/* Hastawara */}
                    {profileData.weton?.hastawara && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h3 className="font-semibold text-batik-text mb-1">
                          Hastawara: {profileData.weton.hastawara.name}
                          {profileData.weton.hastawara.meaning &&
                            ` (${profileData.weton.hastawara.meaning})`}
                        </h3>
                        <p className="text-gray-700">
                          {profileData.weton.hastawara.description}
                        </p>
                      </div>
                    )}

                    {/* Display any other direct properties of weton if they exist and are simple values */}
                    {Object.entries(profileData.weton).map(([key, value]) => {
                      // Avoid re-rendering complex objects or already handled properties
                      if (
                        typeof value !== "object" &&
                        ![
                          "dina",
                          "pasaran",
                          "neptu_dina",
                          "neptu_pasaran",
                          "total_neptu",
                          "dina_en",
                        ].includes(key) &&
                        value !== null &&
                        value !== undefined
                      ) {
                        return (
                          <div
                            key={key}
                            className="pt-3 mt-3 border-t border-gray-200"
                          >
                            <DetailItem
                              label={key
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                              value={String(value)}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                {activeTab === "wuku" && profileData.wuku && (
                  <div className="space-y-6 text-sm">
                    <div>
                      <h3 className="font-semibold text-batik-text mb-1">
                        Wuku: {profileData.wuku?.name}
                      </h3>
                      {profileData.wuku?.character && (
                        <p className="text-gray-700">
                          {profileData.wuku.character}
                        </p>
                      )}
                    </div>

                    {profileData.wuku?.god && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h4 className="font-semibold text-batik-text mb-1">
                          Guardian Deity: {profileData.wuku.god}
                        </h4>
                        {profileData.wuku?.god_meaning && (
                          <p className="text-gray-700">
                            {profileData.wuku.god_meaning}
                          </p>
                        )}
                      </div>
                    )}

                    {profileData.wuku?.tree && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h4 className="font-semibold text-batik-text mb-1">
                          Tree: {profileData.wuku.tree}
                        </h4>
                        {profileData.wuku?.tree_meaning && (
                          <p className="text-gray-700">
                            {profileData.wuku.tree_meaning}
                          </p>
                        )}
                      </div>
                    )}

                    {profileData.wuku?.bird && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h4 className="font-semibold text-batik-text mb-1">
                          Bird: {profileData.wuku.bird}
                        </h4>
                        {profileData.wuku?.bird_meaning && (
                          <p className="text-gray-700">
                            {profileData.wuku.bird_meaning}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "settings" && profileData && (
                  <div className="space-y-6 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                      <DetailItem
                        label="Username"
                        value={profileData.username}
                      />
                      <DetailItem label="Email" value={user?.email} />
                      <DetailItem
                        label="Birth Date"
                        value={
                          profileData.birth_date
                            ? new Date(
                                profileData.birth_date
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"
                        }
                      />
                      <DetailItem label="Gender" value={profileData.gender} />
                      <DetailItem
                        label="Subscription"
                        value={profileData.subscription_status || "Free Tier"}
                      />
                    </div>
                    <div className="pt-6 border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            !loadingProfile &&
            !error && (
              <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6 border border-gray-200 text-center text-gray-500">
                Profile data could not be loaded or is incomplete.
              </div>
            )
          )}

          {/* --- Readings History Section (Kept commented as per original, can be uncommented and styled later) --- */}
          {/* <div className="mb-10">
            {" "}
            <h2 className="text-xl font-semibold mb-3 text-batik-black">
              Reading History
            </h2>
            {loadingReadings ? (
              <p className="text-gray-600 text-sm">Loading readings...</p>
            ) : readingsData.length > 0 ? (
              <ul className="space-y-3">
                {readingsData.map((reading) => (
                  <li
                    key={reading.id}
                    className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-150"
                  >
                    <Link
                      href={`/readings/${reading.reading_category}/${reading.slug}`}
                      className="block"
                    >
                      <p className="text-sm font-medium text-batik-brown hover:underline">
                        {reading.title || "Untitled Reading"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(reading.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </Link>
                  </li>
                ))}

                {readingsData.length >= 10 && (
                  <li className="text-center mt-4">
                    <Link
                      href="/readings/history"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      View All Readings
                    </Link>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-gray-600 text-sm bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                You haven't generated any readings yet.
              </p>
            )}
          </div> */}
        </div>
        <Menubar page={"profile"} />
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
