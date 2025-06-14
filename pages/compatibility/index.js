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
import { Menubar } from "@/components/layouts/menubar";
import { SunIcon, MoonStarIcon } from "lucide-react";
import { getWuku, getWeton, getWetonPrimbon, getWetonJodoh } from "@/utils";

export default function CompatibilityPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState(null);
  const [readingsData, setReadingsData] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("weton");

  const [birthDate, setBirthDate] = useState("");
  const [partnerProfile, setPartnerProfile] = useState({});
  const [wetonJodoh, setWetonJodoh] = useState({});

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

  const handleTest = () => {
    const wuku_data = getWuku(birthDate);
    const weton_data = getWeton(birthDate);
    // const saptawara = getWetonPrimbon(birthDate);
    // setWetonPartner(weton_data);
    // setWukuPartner(wuku_data);
    setPartnerProfile({
      full_name: "Partner Name",
      birthDate: birthDate,
      dina_pasaran: weton_data.weton_en,
      gender: "",
      username: "",
      email: "",
      wuku: wuku_data,
      weton: weton_data,
    });
  };

  const calculateWetonJodoh = async () => {
    if (!partnerProfile || !profileData) return;
    try {
      const result = await getWetonJodoh(profileData, partnerProfile);
      setWetonJodoh(result);
    } catch (error) {
      console.error("Error calculating Weton Jodoh:", error);
      setError("Failed to calculate Weton Jodoh.");
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
  console.log(partnerProfile);
  console.log(wetonJodoh);

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
        <Navbar title="Compatibility" />
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
            <label
              className="block text-gray-700 mb-2 font-semibold"
              htmlFor="birthDate"
            >
              Birth Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 block border-0 border-b-2 border-batik-border-light text-lg"
              required
            />
            <button onClick={handleTest} className="btn btn-secondary">
              Get Partner Profile
            </button>
            {partnerProfile.full_name && (
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
                    value={partnerProfile.birthDate}
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
            <button onClick={calculateWetonJodoh} className="btn btn-primary">
              Get Weton Jodoh
            </button>
            {wetonJodoh && (
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
          </div>

          {/* {profileData ? (
            <div className="px-5">
              <div className="bg-base-100 rounded-lg p-4 md:p-6 mb-6 border border-[var(--color-batik-border)]">
                <div className="space-y-3 text-sm">
                  <DetailItem
                    label="Dina Pasaran"
                    value={profileData?.dina_pasaran}
                  />
                  <DetailItem
                    label="Total Neptu"
                    value={profileData.weton?.total_neptu}
                  />
                  <DetailItem
                    label="Laku"
                    value={profileData?.weton?.laku?.name}
                  />
                  <DetailItem
                    label="Rakam"
                    value={profileData?.weton?.rakam?.name}
                  />
                  <DetailItem label="Wuku" value={profileData.wuku?.name} />
                  <DetailItem
                    label="Pancasuda"
                    value={profileData.weton.saptawara.name}
                  />
                  <DetailItem
                    label="Sadwara"
                    value={profileData.weton.sadwara.name}
                  />
                  <DetailItem
                    label="Hastawara"
                    value={profileData.weton.hastawara.name}
                  />
                </div>
              </div>
            </div>
          ) : (
            !loadingProfile &&
            !error && (
              <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6 border border-gray-200 text-center text-gray-500">
                Profile data could not be loaded or is incomplete.
              </div>
            )
          )} */}
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
