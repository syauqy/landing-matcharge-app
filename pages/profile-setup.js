import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function ProfileSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthLocation, setBirthLocation] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState("");

  // Effect to redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Effect to check if profile already exists and redirect if complete
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && data && data.birth_date) {
          // Profile already exists and has birth_date set, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };

    if (user) {
      checkProfile();
    }
  }, [user, router]);

  // Effect to check username availability with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [username]);

  // Function to check if username is available
  const checkUsernameAvailability = async (value) => {
    if (!value || value.trim() === "") {
      setUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    // Only allow alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameAvailable(false);
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    // Check minimum length
    if (value.length < 3) {
      setUsernameAvailable(false);
      setUsernameError("Username must be at least 3 characters long");
      return;
    }

    if (!user) {
      setUsernameAvailable(null);
      setUsernameError("Authentication required");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError("");

    try {
      // Get the current session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      // Use our new API endpoint to check username availability
      const response = await fetch("/api/check-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username: value.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const { available } = await response.json();

      if (available) {
        // Username is available
        setUsernameAvailable(true);
      } else {
        // Username is taken
        setUsernameAvailable(false);
        setUsernameError("Username is already taken");
      }
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameAvailable(null);
      setUsernameError("Error checking username");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Function to request weton analysis and save to readings table
  const requestWetonAnalysis = async (profileId, birthDate) => {
    try {
      // Get access token for API request
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("Error getting auth token for weton analysis");
        return;
      }

      // Call the API to get weton fortune
      const response = await fetch("/api/get-fortune", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Error getting weton analysis:", await response.text());
        return;
      }

      const fortuneData = await response.json();

      // Use the authenticated client
      const supabaseUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        }
      );

      // Save the reading to the readings table
      const readingData = {
        user_id: profileId,
        username: username,
        weton_details: fortuneData.wetonDetails,
        analysis: fortuneData.analysis,
        created_at: new Date().toISOString(),
        reading_type: "basic", // Marking this as a basic/initial reading
      };

      const { error: saveError } = await supabaseUserClient
        .from("readings")
        .insert(readingData);

      if (saveError) {
        console.error("Error saving reading:", saveError);
      }

      // No need to increment readings_count here as the API should have done that
    } catch (err) {
      console.error("Error in weton analysis process:", err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    // Validate required fields
    if (!username) {
      setError("Username is required");
      setSaving(false);
      return;
    }

    if (!usernameAvailable) {
      setError(usernameError || "Please choose a valid username");
      setSaving(false);
      return;
    }

    if (!birthDate) {
      setError("Birth date is required");
      setSaving(false);
      return;
    }

    if (!gender) {
      setError("Gender is required");
      setSaving(false);
      return;
    }

    // Create profile data object
    const profileData = {
      id: user.id,
      username: username.toLowerCase(), // Store username in lowercase
      gender: gender,
      birth_date: birthDate,
      // birth_location: birthLocation || null,
      // Initialize readings_count if first time setup
      readings_count: 0,
    };

    try {
      // Get the current session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      // Get environment variables for Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Create a client with proper authentication
      const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      });

      // Check if profile exists
      const { data: existingProfile, error: existingError } =
        await supabaseUserClient
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

      if (existingError && existingError.code !== "PGRST116") {
        throw existingError;
      }

      let error;

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabaseUserClient
          .from("profiles")
          .update(profileData)
          .eq("id", user.id);
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabaseUserClient
          .from("profiles")
          .insert(profileData);
        error = insertError;
      }

      if (error) throw error;

      setMessage("Profile saved successfully! Preparing your weton reading...");

      // Request weton analysis right after profile creation
      await requestWetonAnalysis(user.id, birthDate);

      // Redirect to dashboard after successful save and analysis
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500); // Allow more time for analysis
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center relative">
          <h1 className="text-lg font-medium">Complete Your Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Welcome to Wetonscope
          </h1>

          <p className="mb-6 text-center text-gray-600">
            Please provide your birth details to get your personalized Weton
            readings.
          </p>

          {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
          {message && (
            <p className="mb-4 text-green-600 text-center">{message}</p>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Username - Required */}
            <div>
              <label
                className="block text-gray-700 mb-2 font-medium"
                htmlFor="username"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    usernameAvailable === true
                      ? "border-green-500 focus:border-green-500 focus:ring-green-200"
                      : usernameAvailable === false
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "focus:border-blue-300 focus:ring-blue-200"
                  }`}
                  placeholder="Choose a unique username"
                  required
                  maxLength={20}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {/* Heroicons: arrow-path (with animation) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="animate-spin h-5 w-5 text-gray-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                {!isCheckingUsername && usernameAvailable === true && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {/* Heroicons: check-circle */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-green-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="text-xs text-red-500 mt-1">{usernameError}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Used for your profile identification - must be unique and
                contain only letters, numbers, and underscores
              </p>
            </div>

            {/* Birth Date - Required */}
            <div>
              <label
                className="block text-gray-700 mb-2 font-medium"
                htmlFor="birthDate"
              >
                Birth Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for Weton calculation
              </p>
            </div>

            {/* Gender - Required */}
            <div>
              <label
                className="block text-gray-700 mb-2 font-medium"
                htmlFor="gender"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Required for personalized readings
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                saving ||
                !birthDate ||
                !gender ||
                !username ||
                !usernameAvailable ||
                isCheckingUsername
              }
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition duration-150 ease-in-out font-medium"
            >
              {saving
                ? "Creating your profile..."
                : usernameAvailable && username && gender && birthDate
                ? "Check my readings"
                : "Complete all required fields"}
            </button>
          </form>
        </div>
      </div>

      {/* Privacy Policy & Terms of Service Footer */}
      <footer className="w-full py-4 px-4 bg-transparent">
        <div className="max-w-md mx-auto text-center text-xs text-gray-500">
          <p>
            By continuing, your birth details will be securely stored to provide
            personalized Weton readings.
          </p>
        </div>
      </footer>
    </div>
  );
}
