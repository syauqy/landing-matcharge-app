import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { getWeton, getWuku } from "@/utils";
import { Toaster, toast } from "sonner";
import { Navbar } from "@/components/layouts/navbar";
import { config } from "@/utils/config";
import axios from "axios";
import { AnimatedLoadingText } from "@/components/readings/AnimatedLoadingText";
import { userRegistrationLoadingMessages } from "@/lib/loading-content";

export default function ProfileSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingWeton, setLoadingWeton] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState("");
  const [introComplete, setIntroComplete] = useState(false);
  const [showBirthTimeChecker, setShowBirthTimeChecker] = useState(false);
  const [wetonData, setWetonData] = useState(null);
  const [wukuData, setWukuData] = useState(null);
  const onboardingSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  console.log(user);

  // Effect to redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && data && data.birth_date) {
          router.push("/home");
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };

    if (user) {
      checkProfile();
      setFullName(user?.user_metadata?.full_name);
      setUsername(user?.email ? user.email.split("@")[0] : "");
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

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", username.toLowerCase());

      if (data && data.length == 0) {
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

    if (!birthTime) {
      toast.error("Birth time is required");
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

    const wetonDetails = getWeton(birthDate, birthTime);
    const wukuDetails = getWuku(birthDate, birthTime);

    const profileData = {
      id: user.id,
      username: username.toLowerCase(),
      full_name: fullName,
      gender: gender,
      birth_date: birthDate,
      birth_time: birthTime,
      email: user?.email,
      subscription: "free",
      weton: wetonDetails,
      wuku: wukuDetails,
      dina_pasaran: wetonDetails?.weton_en,
      avatar_url: user?.user_metadata?.avatar_url,
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

      //generate the weton and wuku readings after registration
      const { data: wetonData, error: wetonError } = await supabaseUserClient
        .from("readings")
        .insert([
          {
            user_id: user.id,
            reading_type: "basic",
            username: username.toLowerCase(),
            title: "Weton",
            subtitle:
              "Uncover the foundational energies of your unique birth day combination.",
            reading_category: "general_readings",
            slug: "weton",
          },
          {
            user_id: user.id,
            reading_type: "basic",
            username: username.toLowerCase(),
            title: "Wuku",
            subtitle:
              "Explore the distinct characteristics and symbolic influences of your birth week.",
            reading_category: "general_readings",
            slug: "wuku",
          },
        ])
        .select();

      generateFreeReading(profileData);

      if (wetonError) throw wetonError;
      if (error) throw error;

      toast.success(
        "Profile saved successfully! Preparing your weton reading..."
      );
      setLoadingWeton(true);

      if (wetonData) {
        router.push("/intro");
      }

      // await requestWetonAnalysis(user.id, birthDate);
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const generateFreeReading = async (profileData) => {
    if (!profileData || !user) {
      console.error("Profile data or user not available.");
      return;
    } else {
      try {
        const response = await axios.post(
          `${config.api.url}/readings/general/primary-traits`,
          { profile: profileData },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const response_loveCore = await axios.post(
          `${config.api.url}/readings/love/love-core`,
          { profile: profileData },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (err) {
        console.error(
          "Error in fetch or processing response for primary traits:",
          err
        );
      }
    }
  };

  const nextStep = () => {
    if (currentStep === 5 && (!username || !usernameAvailable)) {
      toast.error(usernameError || "Please choose a valid username");
      return;
    }

    if (currentStep === 6 && !fullName) {
      toast.error("Full name is required");
      return;
    }

    if (currentStep === 7 && !birthDate) {
      toast.error("Birth date is required");
      return;
    }

    if (currentStep === 8 && !birthTime) {
      toast.error("Birth time is required");
      return;
    } else if (currentStep === 8 && birthTime) {
      const wetonDetails = getWeton(birthDate, birthTime);
      const wukuDetails = getWuku(birthDate, birthTime);
      setWetonData(wetonDetails);
      setWukuData(wukuDetails);
    }

    if (currentStep === 11 && !gender) {
      toast.error("Gender is required");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // console.log("Weton Data:", wetonData);
  // console.log("Wuku Data:", wukuData);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (loadingWeton) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 p-5">
        <div className="text-center flex flex-col gap-2 items-center">
          <AnimatedLoadingText messages={userRegistrationLoadingMessages} />
          <p className="text-slate-600 text-sm">
            Please wait while we analyze your birth details.
          </p>
        </div>
      </div>
    );
  }

  if (introComplete) {
    return (
      <div className="h-[100svh] flex flex-col bg-base-100">
        <Toaster position="top-center" richColors />
        <Navbar title="Complete Your Profile" />
        <div className="flex-grow flex items-center justify-center p-5">
          <div className="w-full h-[100%] max-w-md">
            <progress
              className="progress bg-slate-100 text-batik-border w-full mb-2"
              value={currentStep}
              max={onboardingSteps.length}
            ></progress>

            <form
              onSubmit={handleSaveProfile}
              className="space-y-6 h-[100%] flex flex-col justify-between"
            >
              {/* Step 1: Username */}
              {currentStep === 5 && (
                <div className="h-[100%]">
                  <p className="mb-6 text-center text-gray-700 h-[30%] text-sm">
                    Please provide your details to get your personalized Weton
                    readings.
                  </p>
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
                        className={`w-full lowercase mt-0 block border-0 border-b-2 border-batik-border-light px-0.5 py-2 text-lg focus:border-batik-border-hover focus:ring-0 appearance-none focus:outline-0 ${
                          usernameAvailable === true
                            ? "border-green-500 focus:border-green-500"
                            : usernameAvailable === false
                            ? "border-red-500 text-red-500"
                            : !username.length > 0
                            ? "border-red-500 text-red-500"
                            : ""
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
                      {!isCheckingUsername &&
                        usernameAvailable &&
                        username.length > 2 === true && (
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
                      <p className="text-xs text-red-500 mt-1">
                        {usernameError}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Used for your profile identification - must be unique and
                      contain only letters, numbers, and underscores
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Full Name */}
              {currentStep === 6 && (
                <div className="h-[100%]">
                  <p className="mb-6 text-center text-gray-700 h-[30%] text-sm">
                    Please provide your details to get your personalized Weton
                    readings.
                  </p>
                  <div className="h-[40%]">
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
                      className="w-full px-0.5 py-2 block border-0 border-b-2 border-batik-border-light text-lg appearance-none focus:outline-0"
                      placeholder="Enter your full name"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Required for character traits analysis
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Birth Date */}
              {currentStep === 7 && (
                <div className="h-[100%]">
                  <p className="mb-6 text-center text-gray-700 h-[30%] text-sm">
                    Please provide your details to get your personalized Weton
                    readings.
                  </p>
                  <div className="h-[40%]">
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
                      className="w-full px-3 py-2 block border-0 border-b-2 border-batik-border-light text-lg appearance-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Required for Weton and Wuku calculation
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Birth Time */}
              {currentStep === 8 && (
                <div className="h-[100%]">
                  <p className="mb-6 text-center text-gray-700 h-[30%] text-sm">
                    Please provide your details to get your personalized Weton
                    readings.
                  </p>
                  <div className="h-[40%]">
                    <label
                      className="block text-gray-700 mb-2 font-semibold"
                      htmlFor="birthTime"
                    >
                      Birth Time <span className="text-red-500">*</span>
                    </label>
                    {!showBirthTimeChecker && (
                      <input
                        type="time"
                        id="customBirthTime"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="w-full px-3 py-2 block border-0 border-b-2 border-batik-border-light text-lg appearance-none"
                        required
                      />
                    )}
                    {/* Checkbox for "I don't know my birth time" */}
                    <div className="mt-3">
                      <label className="flex items-center gap-2 text-base text-gray-700 has-checked:font-semibold">
                        <input
                          className="checkbox border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                          type="checkbox"
                          checked={showBirthTimeChecker === true}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShowBirthTimeChecker(true);
                              setBirthTime("06:00"); // Default to "I don't know" option
                            } else {
                              setShowBirthTimeChecker(false);
                              setBirthTime(""); // Reset time input
                            }
                          }}
                        />
                        I don't know my birth time
                      </label>
                    </div>

                    {/* If user doesn't know birth time, show options */}
                    {showBirthTimeChecker && (
                      <div className="mt-2">
                        <label className="block text-sm text-gray-700 mb-2">
                          No exact time? Do you know the vibe?
                        </label>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <label className="flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                            <input
                              className="radio radio-sm  border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                              type="radio"
                              name="unknownBirthTime"
                              value="06:00"
                              checked={birthTime === "06:00"}
                              onChange={() => setBirthTime("06:00")}
                            />
                            Morning
                          </label>
                          <label className="flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                            <input
                              className="radio radio-sm  border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                              type="radio"
                              name="unknownBirthTime"
                              value="12:00"
                              checked={birthTime === "12:00"}
                              onChange={() => setBirthTime("12:00")}
                            />
                            Afternoon
                          </label>
                          <label className="flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                            <input
                              className="radio radio-sm border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                              type="radio"
                              name="unknownBirthTime"
                              value="20:00"
                              checked={birthTime === "20:00"}
                              onChange={() => setBirthTime("20:00")}
                            />
                            Evening
                          </label>
                          <label className="flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                            <input
                              className="radio radio-sm border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                              type="radio"
                              name="unknownBirthTime"
                              value="22:00"
                              checked={birthTime === "22:00"}
                              onChange={() => setBirthTime("22:00")}
                            />
                            Night
                          </label>
                          <label className="col-span-2 flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                            <input
                              className="radio radio-sm border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                              type="radio"
                              name="unknownBirthTime"
                              value="01:00"
                              checked={birthTime === "01:00"}
                              onChange={() => setBirthTime("01:00")}
                            />
                            Sorry, I have no clue
                          </label>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      This helps us get your Weton reading just right.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Show Weton Card */}
              {currentStep === 9 && (
                <div className="h-[65%]">
                  <h2 className="text-2xl font-bold text-center">
                    {fullName?.split(" ")[0] || ""}, your Weton is{" "}
                    <div className="text-batik-text">
                      {wetonData?.weton_en || "Unknown"}
                    </div>
                  </h2>
                  <div className="card h-fit bg-base-100 border border-[var(--color-batik-border)] shadow-sm mt-3">
                    <div className="card-body p-4 flex flex-col items-center justify-between">
                      <div className="text-center flex flex-col gap-4">
                        <h3 className="text-xl font-semibold text-slate-800">
                          {wetonData?.watak_weton?.archetype || "Unknown"}
                        </h3>
                        <h4 className="text-base text-center font-medium text-slate-700 mb-3">
                          {wetonData?.watak_weton?.vibe || "Unknown"}
                        </h4>
                        <div className="flex flex-row gap-3 text-left mb-1">
                          <div className="text-2xl">❇️</div>
                          <div className="text-sm">
                            {wetonData?.watak_weton?.green_flags}
                          </div>
                        </div>
                        <div className="flex flex-row gap-3 text-left">
                          <div className="text-2xl">🚩</div>
                          <div className="text-sm">
                            {wetonData?.watak_weton?.potential_challenges}
                          </div>
                        </div>
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Show Wuku Card */}
              {currentStep === 10 && (
                <div className="h-[65%]">
                  <h2 className="text-2xl font-bold text-center">
                    {fullName?.split(" ")[0] || ""}, your Weton is{" "}
                    <div className="text-batik-text">
                      {wukuData?.name || "Unknown"}
                    </div>
                  </h2>
                  <div className="card h-fit bg-base-100 border border-[var(--color-batik-border)] shadow-sm mt-3">
                    <div className="card-body p-4 flex flex-col items-center gap-5">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                          {wukuData?.name || "Unknown"}
                        </h3>
                        <p className="text-[16px] text-slate-600 line-clamp-[10]">
                          {wukuData?.short_character || "unknown"}
                        </p>
                      </div>
                      <div className="w-full flex flex-col gap-4 text-sm text-gray-700">
                        <div className="text-left">
                          <h3 className="text-sm font-medium text-batik-text">
                            👑 Guardian Deity
                          </h3>
                          <p className="text-slate-700 text-sm font-semibold">
                            {wukuData?.god || "Unknown"}
                          </p>
                        </div>
                        <div className="flex flex-row gap-4 text-left">
                          <div>
                            <h3 className="text-sm font-medium text-batik-text">
                              🌳 Tree
                            </h3>
                            <p className="text-slate-700 text-sm font-semibold">
                              {wukuData?.tree || "Unknown"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-batik-text">
                              🕊️ Bird
                            </h3>
                            <p className="text-slate-700 text-sm font-semibold">
                              {wukuData?.bird || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 11: Gender */}
              {currentStep === 11 && (
                <div className="h-[100%]">
                  <p className="mb-6 text-center text-gray-700 h-[30%] text-sm">
                    Please provide your details to get your personalized Weton
                    readings.
                  </p>
                  <div className="h-[40%]">
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
                      className="w-full py-2 pl-0.5 pr-10 block border-0 border-b-2 border-batik-border-light text-lg appearance-none focus:outline-0"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Required for personalized and compatibility readings
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-2 pb-8">
                {currentStep < 11 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 5 && !usernameAvailable) ||
                      !username.length > 0 ||
                      (currentStep === 6 && !fullName) ||
                      (currentStep === 7 && !birthDate) ||
                      (currentStep === 8 && !birthTime) ||
                      (currentStep === 11 && !gender)
                    }
                    className="bg-batik-border text-batik-white font-semibold py-2 px-4 rounded-lg hover:bg-batik-border-hover transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
                  >
                    Continue
                  </button>
                )}
                {/* Step 5: Submit */}
                {currentStep === 11 && (
                  <button
                    type="submit"
                    disabled={saving || (currentStep === 11 && !gender)}
                    className="bg-batik-border text-batik-white font-semibold py-2 px-4 rounded-lg hover:bg-batik-border-hover transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
                  >
                    {saving
                      ? "Generating your reading"
                      : "Check my full reading"}
                  </button>
                )}
                {currentStep < 12 && currentStep > 5 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className=" text-gray-600 py-2 px-4 rounded-lg hover:text-gray-800 transition duration-150 ease-in-out font-semibold text-sm cursor-pointer"
                  >
                    Back
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {currentStep === 9 || currentStep === 10 ? (
          <></>
        ) : (
          <footer className="w-full py-5 px-4 bg-transparent">
            <div className="max-w-md mx-auto text-center text-xs text-gray-500">
              <p>
                By continuing, your birth details will be securely stored to
                provide personalized Weton readings. We never share or sell your
                details.
              </p>
            </div>
          </footer>
        )}
      </div>
    );
  }

  if (!introComplete) {
    return (
      <div className="h-[100svh] flex flex-col bg-base-100">
        <Toaster position="top-center" richColors />
        <Navbar title="Wetonscope" />
        <div className="flex-grow flex items-center justify-center p-5">
          <div className="w-full h-[100%] max-w-md">
            <progress
              className="progress bg-slate-100 text-batik-border w-full"
              value={currentStep}
              max={onboardingSteps.length}
            ></progress>
            <div className="space-y-6 h-[100%] flex flex-col justify-between">
              {/* Step 1: Daily Reading */}
              {currentStep === 1 && (
                <div className="">
                  <h2 className="text-3xl font-bold">
                    Start Your Day with Clarity
                  </h2>
                  <p className="text-sm text-slate-600 mt-2">
                    Receive a daily reading tuned to your unique energy, going
                    deeper than a standard horoscope. Navigate your day with
                    intention.
                  </p>
                  <div className="card bg-base-100 border border-[var(--color-batik-border)] shadow-sm mt-6">
                    <div className="card-body p-4">
                      <p className="text-sm font-semibold">
                        🗓️ August 9 (Saturday Pon)
                      </p>
                      <p className="text-lg font-semibold mb-2 text-base-content">
                        Social, expressive day
                      </p>
                      <p className="leading-5 text-gray-800">
                        Today, as Saturday Pon, a day marked as very
                        inauspicious and Gigis for financial matters, your
                        charming Senin Kliwon energy, Aras Kembang, calls for
                        extra caution. It's a time to be introspective and avoid
                        major decisions, especially concerning your finances, as
                        obstacles may arise.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Weton */}
              {currentStep === 2 && (
                <div className="">
                  <h2 className="text-3xl font-bold">
                    Discover Your Soul's Blueprint
                  </h2>
                  <p className="text-sm text-slate-600 mt-2">
                    Learn your Weton archetype to understand your core
                    strengths, challenges, and natural way of being.
                  </p>
                  <div className="card bg-base-100 border border-[var(--color-batik-border)] shadow-sm mt-6">
                    <div className="card-body p-4">
                      <div className="flex flex-row justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Morgan Ashley
                          </h3>
                          <p className="text-sm text-slate-600 font-light">
                            20 July 1992 - 08.45
                          </p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-3xl">🔮</div>
                          <div className="font-semibold">Weton</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">Monday Kliwon</h3>
                        <p className="text-slate-600 font-medium text-base">
                          The Ride-or-Die Guardian
                        </p>
                      </div>
                      <p className="leading-5 text-gray-800">
                        You are incredibly dedicated to your loved ones and will
                        sacrifice anything for them. Your politeness, gentle
                        nature, and skill with words earn you immense respect.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Wuku */}
              {currentStep === 3 && (
                <div className="">
                  <h2 className="text-3xl font-bold">
                    The Story Behind Your Energy
                  </h2>
                  <p className="text-sm text-slate-600 mt-2">
                    Your Wuku reveals the sacred story of your birth week,
                    complete with a guiding deity, symbolic tree, and spirit
                    animal.
                  </p>
                  <div className="card bg-base-100 border border-[var(--color-batik-border)] shadow-sm mt-6">
                    <div className="card-body p-4">
                      <div>
                        <h3 className="text-sm font-semibold text-batik-text">
                          Wuku
                        </h3>
                        <p className="text-slate-700 text-base font-semibold">
                          Kuningan
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-batik-text">
                          👑 Guardian Deity
                        </h3>
                        <p className="text-slate-700 text-base font-semibold">
                          Batara Indera (King of Gods)
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-batik-text">
                          🌳 Tree - Queen of the Night
                        </h3>
                        <p className="text-slate-700 text-sm ">
                          Symbolizes exceptional beauty, sacred power, high
                          character, meticulousness, avoidance of crowds, and
                          inner peace.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-batik-text">
                          🕊️ Bird - Javan Kingfisher
                        </h3>
                        <p className="text-slate-700 text-sm ">
                          Represents speed in work, quickness to anger, and
                          shyness.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Compatibility */}
              {currentStep === 4 && (
                <div className="">
                  <h2 className="text-3xl font-bold">
                    Understand the Vibe Between You
                  </h2>
                  <p className="text-sm text-slate-600 mt-2">
                    Check your energetic compatibility with friends and partners
                    to build deeper, more meaningful connections.
                  </p>
                  <div className="card bg-base-100 border border-[var(--color-batik-border)] shadow-sm mt-6">
                    <div className="card-body p-4 flex flex-col">
                      <div className="flex mt-2 flex-row justify-between">
                        <div className="flex-col flex items-center w-[45%]">
                          <h3 className="font-semibold text-lg mb-2">
                            Morgan Ashley
                          </h3>
                          <div className="avatar">
                            <div className="size-24 ring-3 ring-offset-2 ring-batik-border rounded-full">
                              <img src={"/morgan.jpg"} alt={"morgan ashley"} />
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-xl font-bold text-batik-black"></p>
                            <div className="flex flex-col items-center text-sm">
                              <div className="flex items-center gap-1">
                                Monday Kliwon
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow w-fit">
                          <div className="flex h-full justify-center items-center text-2xl font-semibold">
                            💖
                          </div>
                        </div>
                        <div className="flex-col flex items-center w-[45%] ">
                          <h3 className="text-lg font-semibold mb-2">
                            Alex Carter
                          </h3>
                          <div className="avatar">
                            <div className="size-24 ring-3 ring-offset-2 ring-batik-border rounded-full">
                              <img src={"/alex.jpg"} alt={"alex carter"} />
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex flex-col items-center text-sm">
                              <div className="flex items-center gap-1">
                                Thurday Legi
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-center">
                        The Ressilient Pillars
                      </div>
                      <div className="py-2 px-4 rounded-2xl border-slate-300 border mx-auto w-fit">
                        🤔 <span className="font-semibold">45%</span>{" "}
                        Compatibility
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Navigation Buttons */}
        <div className="flex flex-col gap-2 absolute z-10 bottom-0 w-full p-5 pb-10">
          {currentStep < 4 && (
            <button
              type="button"
              onClick={nextStep}
              className="bg-batik-border active:bg-batik-border-hover delay-150 hover:-translate-y-1 text-batik-white font-semibold py-2 px-4 rounded-lg hover:bg-batik-border-hover transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
            >
              Continue
            </button>
          )}
          {currentStep === 4 && (
            <button
              type="buttuon"
              onClick={() => {
                setIntroComplete(true);
                nextStep();
              }}
              className="bg-batik-border text-batik-white font-semibold py-2 px-4 rounded-lg hover:bg-batik-border-hover transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
            >
              Continue
            </button>
          )}
          {currentStep < 5 && currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className=" text-gray-600 py-2 px-4 rounded-lg hover:text-gray-800 transition duration-150 ease-in-out font-semibold text-sm cursor-pointer"
            >
              Back
            </button>
          )}
        </div>
      </div>
    );
  }
}
