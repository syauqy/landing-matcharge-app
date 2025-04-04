import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { getWeton } from "@/utils";
import { Toaster, toast } from "sonner";

export default function ProfileSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingWeton, setLoadingWeton] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState("");

  // Effect to redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };

    if (user) {
      checkProfile();
      setFullName(user?.identities[0]?.identity_data?.full_name);
    }
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const checkUsernameAvailability = async (value) => {
    if (!value || value.trim() === "") {
      setUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameAvailable(false);
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

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
        setUsernameAvailable(true);
      } else {
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

  const requestWetonAnalysis = async (profileId, birthDate) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("Error getting auth token for weton analysis");
        return;
      }

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

      const supabaseUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        }
      );

      const readingData = {
        user_id: profileId,
        username: username,
        reading: fortuneData.analysis,
        created_at: new Date().toISOString(),
        reading_type: "free",
        title: "Basic",
        reading_category: "general_readings",
      };

      console.log("dapeting analysis", readingData);

      console.log("mulai simpan ke supabase");

      const { data, error: saveError } = await supabaseUserClient
        .from("readings")
        .insert(readingData);

      console.log(data);

      if (saveError) {
        console.error("Error saving reading:", saveError);
        toast.error("Failed to save reading data.");
      } else {
        // Redirect only after successful saving
        router.push("/readings/basic");
      }
    } catch (err) {
      console.error("Error in weton analysis process:", err);
      toast.error("Error in weton analysis process.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!username) {
      toast.error("Username is required");
      setSaving(false);
      return;
    }

    if (!usernameAvailable) {
      toast.error(usernameError || "Please choose a valid username");
      setSaving(false);
      return;
    }

    if (!birthDate) {
      toast.error("Birth date is required");
      setSaving(false);
      return;
    }

    if (!gender) {
      toast.error("Gender is required");
      setSaving(false);
      return;
    }

    if (!fullName) {
      toast.error("Full name is required");
      setSaving(false);
      return;
    }

    const wetonDetails = getWeton(birthDate);

    const profileData = {
      id: user.id,
      username: username.toLowerCase(),
      full_name: fullName,
      gender: gender,
      birth_date: birthDate,
      email: user?.email,
      subscription: "free",
      weton: wetonDetails,
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const supabaseUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        }
      );

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
        const { error: updateError } = await supabaseUserClient
          .from("profiles")
          .update(profileData)
          .eq("id", user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabaseUserClient
          .from("profiles")
          .insert(profileData);
        error = insertError;
      }

      if (error) throw error;

      toast.success(
        "Profile saved successfully! Preparing your weton reading..."
      );
      setLoadingWeton(true);
      await requestWetonAnalysis(user.id, birthDate);
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!username || !usernameAvailable)) {
      toast.error(usernameError || "Please choose a valid username");
      return;
    }
    if (currentStep === 2 && !birthDate) {
      toast.error("Birth date is required");
      return;
    }
    if (currentStep === 3 && !gender) {
      toast.error("Gender is required");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (loadingWeton) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-batik p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Preparing Your Weton Reading...
          </h1>
          <p className="text-gray-700">
            Please wait while we analyze your birth details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100svh] flex flex-col bg-batik">
      <Toaster position="top-center" richColors />
      <div className="bg-batik/50 shadow-sm w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center relative">
          <h1 className="text-lg font-semibold text-batik-black">
            Complete Your Profile
          </h1>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-4 ">
        <div className="w-full h-[100%] max-w-md">
          <p className="mb-6 text-center text-gray-700 text-sm h-[30%]">
            Please provide your details to get your personalized Weton readings.
          </p>

          <form
            onSubmit={handleSaveProfile}
            className="space-y-6 h-[60%] flex flex-col justify-between"
          >
            {/* Step 1: Username */}
            {currentStep === 1 && (
              <div className="h-[40%]">
                <label
                  className="block text-gray-700 mb-2 font-semibold"
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
                    className={`w-full mt-0 block border-0 border-b-2 border-batik-border-light px-0.5 py-2 text-lg focus:border-black ${
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
                <p className="text-xs text-gray-500 mt-2">
                  Used for your profile identification - must be unique and
                  contain only letters, numbers, and underscores
                </p>
              </div>
            )}

            {/* Step 2: Birth Date */}
            {currentStep === 2 && (
              <div className="h-[%30]">
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
                <p className="text-xs text-gray-500 mt-2">
                  Required for Weton calculation
                </p>
              </div>
            )}

            {/* Step 3: Gender */}
            {currentStep === 3 && (
              <div>
                <label
                  className="block text-gray-700 mb-2 font-semibold"
                  htmlFor="gender"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full py-2 pl-0.5 pr-10 block border-0 border-b-2 border-batik-border-light text-lg"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Required for personalized readings
                </p>
              </div>
            )}

            {/* Step 4: Full Name */}
            {currentStep === 4 && (
              <div>
                <label
                  className="block text-gray-700 mb-2 font-semibold"
                  htmlFor="fullName"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 block border-0 border-b-2 border-batik-border-light text-lg"
                  placeholder="Enter your full name"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Required for character traits analysis
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-2">
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !usernameAvailable) ||
                    (currentStep === 2 && !birthDate) ||
                    (currentStep === 3 && !gender)
                  }
                  className="bg-batik-border text-batik-white font-semibold py-2 px-4 rounded-lg hover:bg-batik-border-hover transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
                >
                  Continue
                </button>
              )}
              {/* Step 5: Submit */}
              {currentStep === 4 && (
                <button
                  type="submit"
                  disabled={saving || (currentStep === 4 && !fullName)}
                  className="bg-batik-border text-batik-white font-semibold py-2 px-4 rounded-lg hover:bg-batik-border-hover transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
                >
                  {saving ? "Creating your profile..." : "Check my readings"}
                </button>
              )}
              {currentStep < 5 && currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className=" text-gray-600 py-2 px-4 rounded-lg hover:text-gray-800 transition duration-150 ease-in-out font-medium text-sm cursor-pointer"
                >
                  Back
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <footer className="w-full py-4 px-4 bg-transparent">
        <div className="max-w-md mx-auto text-center text-xs text-gray-500">
          <p>
            By continuing, your birth details will be securely stored to provide
            personalized Weton readings. We never share or sell your details.
          </p>
        </div>
      </footer>
    </div>
  );
}
