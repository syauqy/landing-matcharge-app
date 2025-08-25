// pages/profile.js
import Head from "next/head";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link for navigation
import { NavbarProfile } from "@/components/layouts/navbar-profile";
import { Menubar } from "@/components/layouts/menubar";
import { SunIcon, MoonStarIcon, Users2Icon } from "lucide-react";
import { openBrowser, closeBrowser } from "@/utils/native-browser";
import { getWeton, getWuku } from "@/utils";
import { Toaster, toast } from "sonner";
// import { LoadingProfile } from "@/components/layouts/loading-profile";
import { ProfileLoadingSkeleton } from "@/components/layouts/profile-loading-skeleton";
import { InAppReview } from "@capacitor-community/in-app-review";
import { Capacitor } from "@capacitor/core";

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const app_version = {
    version: "1.0.0",
    date: "26062025",
  };

  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [readingsData, setReadingsData] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("weton");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRateApp = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.info("This feature is only available on the mobile app.");
      return;
    }
    try {
      // requestReview will automatically check if it's appropriate to show the dialog.
      await InAppReview.requestReview();
    } catch (error) {
      console.error("Error requesting in-app review:", error);
      // It's best not to bother the user with an error message for this feature.
    }
  };

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

  const handleSupportButton = async (link) => {
    await openBrowser(link);
  };

  const handleRegenerateProfile = async () => {
    if (!profileData || !profileData.birth_date) {
      toast.error("Profile data is incomplete. Cannot regenerate.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to regenerate your profile data? This will re-calculate your Weton and Wuku based on your birth date."
      )
    ) {
      return;
    }

    setIsRegenerating(true);
    setError(null);

    try {
      const wetonDetails = getWeton(
        profileData.birth_date,
        profileData.birth_time
      );
      const wukuDetails = getWuku(
        profileData.birth_date,
        profileData.birth_time
      );

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          weton: wetonDetails,
          wuku: wukuDetails,
          dina_pasaran: wetonDetails?.weton_en,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("Profile data regenerated successfully!");
      await fetchProfile(); // Refetch profile to show updated data
    } catch (err) {
      console.error("Error regenerating profile:", err);
      toast.error(`Failed to regenerate profile: ${err.message}`);
      setError("Failed to regenerate profile data.");
    } finally {
      setIsRegenerating(false);
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

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const { isConfigured } = await Purchases.isConfigured();
      if (!isConfigured) {
        await Purchases.configure({
          apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY,
          appUserID: user.id,
        });
      }

      const { customerInfo } = await Purchases.getCustomerInfo();
      if (customerInfo.managementURL) {
        await openBrowser(customerInfo.managementURL);
      } else {
        toast.error("Subscription management URL not available.");
      }
    } catch (e) {
      toast.error("Failed to get subscription information.");
      console.error(
        "Error getting customer info for subscription management:",
        e
      );
    } finally {
      setIsManagingSubscription(false);
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
  }, [user, authLoading, router]);

  // --- Logout Handler ---
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // if (authLoading || (!profileData && loadingProfile)) {
  //   return <LoadingProfile />;
  // }

  // console.log(profileData);

  const displayAvatarUrl =
    profileData?.avatar_url ||
    (profileData?.full_name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
          profileData?.full_name
        )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          profileData?.username
        )}&background=e0c3a3&color=fff&size=128&rounded=true&bold=true`);

  return (
    <>
      <Head>
        <title>My Profile - Wetonscope</title>
        <meta
          name="description"
          content="View your profile details and reading history."
        />
      </Head>
      <div className="h-[100svh] flex flex-col bg-base relative">
        <Toaster position="top-center" richColors />
        <NavbarProfile title="Profile" />
        {authLoading || (!profileData && loadingProfile) ? (
          <ProfileLoadingSkeleton />
        ) : (
          <div className="flex-grow overflow-y-auto pt-4 sm:pt-6 pb-20">
            {profileData && (
              <div className="px-5 mb-6 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="avatar">
                    <div className="w-16 rounded-full ring-3 ring-offset-2 ring-batik-border">
                      <img
                        src={displayAvatarUrl}
                        alt={profileData?.full_name}
                      />
                    </div>
                  </div>
                  {profileData?.subscription === "pro" && (
                    <div className="absolute rounded-xl px-3 py-0.5 z-10 font-semibold bg-amber-400 text-[10px] -bottom-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-batik-black">
                      PRO
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div className="flex flex-col">
                    <div className="text-xl font-bold text-batik-black overflow-x-clip text-nowrap text-ellipsis">
                      {profileData?.full_name || "Full Name"}
                    </div>
                    <div className="leading-3 text-sm text-gray-500 overflow-x-clip text-nowrap text-ellipsis">
                      {profileData?.username || "username"}
                    </div>
                  </div>
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
                  <Link
                    href="/connections"
                    className="py-1.5 px-3 text-xs inline-flex items-center w-fit rounded-full border text-batik-text border-batik-text hover:bg-batik/80 hover:cursor-pointer"
                  >
                    <Users2Icon size={13} className=" mr-2" />
                    <span>View Connections</span>
                  </Link>
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
                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`${
                        activeTab === "settings"
                          ? "border-batik-text text-batik-black bg-batik-border font-semibold"
                          : "border-transparent text-gray-500 hover:text-batik-text hover:border-batik-text"
                      } whitespace-nowrap py-2 px-4 rounded-2xl font-medium text-sm`}
                    >
                      Settings
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === "weton" && profileData?.weton && (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-row gap-y-4 text-sm">
                        <div className="flex flex-col border-y border-l border-batik-border rounded-l-xl">
                          <div className="border-b border-batik-border px-4 py-2">
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
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Laku
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Pancasuda
                          </div>
                          <div className="px-4 py-2">Rakam</div>
                        </div>
                        <div className="flex flex-col border flex-grow border-batik-border rounded-r-xl font-medium text-batik-black">
                          <Link
                            href="#weton"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profileData?.weton?.weton_en}
                          </Link>
                          <Link
                            href="#dina"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profileData?.weton?.dina_en}
                          </Link>
                          <Link
                            href="#pasaran"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profileData?.weton?.pasaran}
                          </Link>
                          <Link
                            href="#weton"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profileData?.weton?.total_neptu}
                          </Link>
                          <Link
                            href="#laku"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profileData?.weton?.laku?.name}
                          </Link>
                          <Link
                            href="#pancasuda"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profileData?.weton?.saptawara?.name}
                          </Link>
                          <Link href="#rakam" className="px-4 p-2">
                            {profileData?.weton?.rakam?.name}
                          </Link>
                        </div>
                      </div>
                      <div className="bg-base-100 rounded-2xl p-4 md:p-6 mb-6 border border-[var(--color-batik-border)]">
                        <div className="space-y-4 text-sm">
                          {(profileData?.weton?.dina_en ||
                            profileData?.weton?.day_character?.description) && (
                            <div id="dina" className="flex flex-col gap-1">
                              <div className="text-sm font-semibold  text-batik-text">
                                Day (Dina)
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profileData?.weton?.dina_en}
                                </div>
                                <div className="text-base text-gray-700">
                                  {
                                    profileData?.weton?.day_character
                                      ?.description
                                  }
                                </div>
                              </div>
                            </div>
                          )}

                          {(profileData?.weton?.pasaran ||
                            profileData?.weton?.pasaran_character
                              ?.description) && (
                            <div
                              id="pasaran"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Market Day (Pasaran)
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profileData?.weton?.pasaran}
                                </div>
                                <div className="text-base text-gray-700">
                                  {
                                    profileData?.weton?.pasaran_character
                                      ?.description
                                  }
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Weton Energy (Neptu Character) */}
                          {profileData?.weton?.neptu_character?.description && (
                            <div
                              id="weton"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Weton Energy
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profileData?.weton?.weton_en}
                                </div>
                                <div className="text-base text-gray-700">
                                  {
                                    profileData?.weton?.neptu_character
                                      ?.description
                                  }
                                </div>
                                <div className="text-base text-gray-700 mt-2">
                                  {profileData?.weton?.watak_weton?.description}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Laku */}
                          {profileData?.weton?.laku && (
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
                                    {profileData?.weton.laku.name}
                                  </div>
                                  <div className="text-sm font-light text-slate-700">
                                    {profileData?.weton.laku.meaning}
                                  </div>
                                </div>
                                <div className="text-base text-gray-700">
                                  {profileData?.weton.laku.description}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Pancasuda (Saptawara) */}
                          {profileData?.weton?.saptawara && (
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
                                    {profileData?.weton.saptawara.name}
                                  </div>
                                  <div className="text-sm font-light text-slate-700">
                                    {profileData?.weton.saptawara.meaning}
                                  </div>
                                </div>
                                <div className="text-base text-gray-700">
                                  {profileData?.weton.saptawara.description}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Rakam */}
                          {profileData?.weton?.rakam && (
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
                                    {profileData?.weton.rakam.name}
                                  </div>
                                  <div className="text-sm font-light text-slate-700">
                                    {profileData?.weton.rakam.meaning}
                                  </div>
                                </div>
                                <div className="text-base text-gray-700">
                                  {profileData?.weton.rakam.description}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* {profileData.weton?.sadwara && (
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
                        )} */}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "wuku" && profileData?.wuku && (
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
                            {profileData.wuku?.name}
                          </Link>
                          <Link
                            href="#god"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profileData.wuku.god}
                          </Link>
                          <Link
                            href="#tree"
                            className="border-b border-batik-border px-4 py-2"
                          >
                            {profileData.wuku.tree}
                          </Link>
                          <Link href="#bird" className="px-4 py-2">
                            {profileData.wuku.bird}
                          </Link>
                        </div>
                      </div>
                      <div className="bg-base-100 rounded-2xl p-4 md:p-6 mb-6 border border-[var(--color-batik-border)]">
                        <div className="space-y-4 text-sm">
                          {profileData?.wuku?.character && (
                            <div id="wuku" className="flex flex-col gap-1">
                              <div className="text-sm font-semibold  text-batik-text">
                                Wuku
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profileData?.wuku?.name}
                                </div>
                                <div className="text-base text-gray-700">
                                  {profileData?.wuku?.character}
                                </div>
                              </div>
                            </div>
                          )}
                          {profileData?.wuku?.god && (
                            <div
                              id="god"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Guardian Deity
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profileData?.wuku?.god}
                                </div>
                                <div className="text-base text-gray-700">
                                  {profileData.wuku.god_meaning}
                                </div>
                              </div>
                            </div>
                          )}
                          {profileData?.wuku?.tree && (
                            <div
                              id="tree"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Tree
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profileData?.wuku?.tree}
                                </div>
                                <div className="text-base text-gray-700">
                                  {profileData.wuku.tree_meaning}
                                </div>
                              </div>
                            </div>
                          )}
                          {profileData?.wuku?.bird && (
                            <div
                              id="bird"
                              className="flex flex-col gap-1 pt-4 border-t border-batik-border"
                            >
                              <div className="text-sm font-semibold  text-batik-text">
                                Bird
                              </div>
                              <div>
                                <div className="text-lg font-semibold">
                                  {profileData?.wuku?.bird}
                                </div>
                                <div className="text-base text-gray-700">
                                  {profileData.wuku.bird_meaning}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "settings" && profileData && (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-row gap-y-4 text-sm">
                        <div className="flex flex-col border-y border-l border-batik-border rounded-l-xl">
                          <div className="border-b border-batik-border px-4 py-2">
                            Name
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Username
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Email
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Birthdate
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            Gender
                          </div>
                          <div className="px-4 py-2">Subscription</div>
                        </div>
                        <div className="flex flex-col border flex-grow border-batik-border rounded-r-xl font-medium text-batik-black">
                          <div className="border-b border-batik-border px-4 py-2 overflow-x-clip text-nowrap text-ellipsis">
                            {profileData?.full_name}
                          </div>
                          <div className="border-b border-batik-border px-4 py-2 overflow-x-clip text-nowrap text-ellipsis">
                            {profileData?.username}
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            {profileData?.email}
                          </div>
                          <div className="border-b border-batik-border px-4 py-2">
                            {profileData?.birth_date
                              ? new Date(
                                  profileData?.birth_date
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </div>
                          <div className="border-b border-batik-border px-4 py-2 capitalize">
                            {profileData?.gender}
                          </div>
                          <div className="px-4 py-2 capitalize">
                            {profileData?.subscription || "Free"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                          <Link
                            href="/readings/general_readings/weton-intro"
                            className="text-left text-batik-text hover:underline"
                          >
                            See Weton and Wuku Introduction
                          </Link>
                          <button
                            onClick={() =>
                              handleSupportButton(
                                "https://app.wetonscope.com/privacy"
                              )
                            }
                            className="text-left text-batik-text hover:underline"
                          >
                            Privacy Policy
                          </button>
                          <button
                            onClick={() =>
                              handleSupportButton(
                                "https://app.wetonscope.com/terms"
                              )
                            }
                            className="text-left text-batik-text hover:underline"
                          >
                            Terms of Service
                          </button>
                          <div className="py-2 border-t border-gray-200">
                            <button
                              onClick={handleRateApp}
                              className="text-left text-batik-text hover:underline"
                            >
                              Rate the App
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              Enjoying Wetonscope? Let us know!
                            </p>
                          </div>
                          <div className="py-2 border-t border-gray-200">
                            <button
                              onClick={handleManageSubscription}
                              disabled={isManagingSubscription}
                              className="text-left text-batik-text hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              {isManagingSubscription
                                ? "Loading..."
                                : "Manage Subscription"}
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              Change or cancel your subscription.
                            </p>
                          </div>
                          {profileData?.type === "admin" && (
                            <div className="py-2 border-t border-gray-200">
                              <button
                                onClick={handleRegenerateProfile}
                                disabled={isRegenerating}
                                className="text-left text-rose-500 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed font-semibold"
                              >
                                {isRegenerating
                                  ? "Regenerating..."
                                  : "Regenerate Profile Data"}
                              </button>
                              <p className="text-xs text-gray-500 mt-1">
                                Use this if you believe your Weton/Wuku data is
                                incorrect.
                              </p>
                            </div>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto text-red-600 hover:underline text-left font-semibold mt-5"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>

                      <div className="text-center text-xs text-batik-text mt-4">
                        <div className="text-sm font-semibold">Wetonscope</div>
                        <div>
                          App Version: {app_version.version} -{" "}
                          {app_version.date}
                        </div>
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
          </div>
        )}

        <Menubar page={"profile"} />
      </div>
    </>
  );
}
