import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient"; // Adjust path
import { useAuth } from "@/context/AuthContext"; // Adjust path
import { useRouter } from "next/router";

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null); // Initialize state with null
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Effect to redirect if not logged in
  useEffect(() => {
    // Redirect only when auth state is resolved and no user is found
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Effect to fetch profile data once user is available
  useEffect(() => {
    const fetchProfile = async (currentUser) => {
      setLoadingProfile(true);
      setProfileError("");
      try {
        // Fetch profile matching the logged-in user's ID
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single(); // Expecting one row or null

        // Handle potential errors, ignoring 'row not found' which is expected for new users
        if (error && error.code !== "PGRST116") {
          throw error;
        }

        // If data exists, populate state
        if (data) {
          setProfile(data);
          setGender(data.gender || "");
          // Format date for input type="date" (YYYY-MM-DD)
          setBirthDate(data.birth_date ? data.birth_date.split("T")[0] : "");
          setBirthLocation(data.birth_location || "");
        } else {
          // No profile exists yet
          setProfile(null);
        }
      } catch (err) {
        // Catch block doesn't need typed error in JS
        console.error("Error fetching profile:", err);
        setProfileError(`Could not fetch profile data: ${err.message}`);
      } finally {
        setLoadingProfile(false);
      }
    };

    // Fetch profile only if a user object exists
    if (user) {
      fetchProfile(user);
    } else if (!authLoading) {
      // If auth is done loading and there's still no user, stop loading profile
      setLoadingProfile(false);
    }
  }, [user, authLoading]); // Rerun when user or authLoading state changes

  // Function to handle profile form submission
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    if (!user) {
      setProfileError("You must be logged in to update profile.");
      setSavingProfile(false);
      return;
    }

    // Prepare data, ensuring null for empty fields if necessary
    const profileData = {
      id: user.id, // Must include the primary key for insert/upsert
      gender: gender || null,
      birth_date: birthDate || null,
      birth_location: birthLocation || null,
      // readings_count is handled separately/not updated here
      // updated_at is handled by the DB trigger
    };

    try {
      let error; // Variable to hold potential error from Supabase
      if (profile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", user.id); // Match the user ID for update
        error = updateError;
      } else {
        // Insert new profile if one doesn't exist
        const { error: insertError } = await supabase
          .from("profiles")
          .insert(profileData);
        error = insertError;
      }

      if (error) throw error; // Throw if Supabase returned an error

      setProfileMessage("Profile saved successfully!");
      // Update local profile state optimistically or re-fetch
      // For simplicity, update local state:
      setProfile((prevProfile) => ({
        ...(prevProfile || {}), // Keep existing fields like readings_count
        ...profileData, // Overwrite with new data
      }));
    } catch (err) {
      // Catch JS errors
      console.error("Error saving profile:", err);
      setProfileError(`Failed to save profile: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    await logout(); // Call logout from context
    router.push("/login"); // Redirect after state updates
  };

  // Render loading indicator while auth or profile data is loading
  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If loading is done and still no user, user should have been redirected,
  // but this check prevents rendering the dashboard content momentarily before redirect.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-0">
          Weton AI Dashboard
        </h1>
        <div className="text-center sm:text-right">
          <span className="block sm:inline mr-0 sm:mr-4 mb-2 sm:mb-0 text-sm text-gray-600">
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Profile Section */}
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 border-b pb-2">
          Your Profile
        </h2>
        {profileError && (
          <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
            {profileError}
          </p>
        )}
        {profileMessage && (
          <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded">
            {profileMessage}
          </p>
        )}

        <form onSubmit={handleProfileUpdate}>
          {/* Form fields remain the same (Gender, Birth Date, Birth Location) */}
          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Birth Date
            </label>
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="birthLocation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Birth Location
            </label>
            <input
              type="text"
              id="birthLocation"
              value={birthLocation}
              onChange={(e) => setBirthLocation(e.target.value)}
              placeholder="e.g., Jakarta, Indonesia"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out text-sm font-medium"
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Placeholder for Fortune Telling Section (Day 3) */}
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 border-b pb-2">
          Weton Fortune
        </h2>
        {/* We will add the fortune telling logic here on Day 3 */}
        <div id="fortune-section">
          <p className="text-gray-600 text-sm">
            {profile && profile.birth_date
              ? "Ready to calculate your fortune."
              : "Please complete your profile (including Birth Date) to calculate your Weton fortune."}
          </p>
          {/* Fortune button and result area will go here */}
        </div>
      </div>
    </div>
  );
}
