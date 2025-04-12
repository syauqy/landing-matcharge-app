// pages/profile.js
import Head from "next/head";
import Image from "next/image"; // Import Next.js Image component for optimization
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link for navigation
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";
import { Menubar } from "@/components/layouts/menubar";

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState(null);
  const [readingsData, setReadingsData] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [error, setError] = useState(null);

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
        router.push("/login");
      } else {
        fetchProfile();
        fetchReadings();
      }
    }
  }, [user, authLoading, router]); // Dependencies

  // --- Logout Handler ---
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // --- Loading States ---
  if (authLoading || (!profileData && loadingProfile)) {
    // Show loading if auth is loading OR if profile hasn't loaded yet
    return (
      <div className="min-h-screen flex items-center justify-center bg-batik">
        <p className="text-batik-black">Loading Profile...</p>
      </div>
    );
  }

  console.log(profileData);

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
      <div className="h-[100svh] flex flex-col bg-batik">
        {/* <DashboardNavbar user={user} handleLogout={handleLogout} /> */}

        <div className="flex-grow overflow-y-auto py-4 sm:py-6 px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-batik-black">
            My Profile
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* --- Profile Information Section --- */}
          {profileData ? (
            <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Profile Picture */}
                {avatarUrl && (
                  <div className="flex-shrink-0">
                    <Image
                      src={avatarUrl}
                      alt={`${profileData.full_name}'s avatar`}
                      width={80} // Adjust size as needed
                      height={80}
                      className="rounded-full border-2 border-batik-brown"
                    />
                  </div>
                )}

                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-semibold text-batik-black">
                    {profileData.full_name || "N/A"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    @{profileData.username || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {/* <DetailItem label="Weton" value={profileData.weton} /> */}
                <DetailItem label="Gender" value={profileData.gender} />
                <DetailItem label="Dina" value={profileData.weton.dina} />
                <DetailItem label="Pasaran" value={profileData.weton.pasaran} />
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
              </div>
            </div>
          ) : (
            !loadingProfile &&
            !error && ( // Show only if not loading and no error
              <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6 border border-gray-200 text-center text-gray-500">
                Profile data could not be loaded or is incomplete.
              </div>
            )
          )}

          {/* --- Readings History Section --- */}
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

        {/* --- Menubar --- */}
        <Menubar />
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
