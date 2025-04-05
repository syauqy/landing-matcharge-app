// pages/dashboard.jsx
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient"; // Adjust path
import { useAuth } from "@/context/AuthContext"; // Adjust path
import { useRouter } from "next/router";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [requestingReading, setRequestingReading] = useState(false);
  const [fortuneResult, setFortuneResult] = useState(null); // Stores { wetonDetails, analysis }
  const [currentReadings, setCurrentReadings] = useState(0); // To display count

  const READING_LIMIT = 2; // Keep limit consistent with API

  // Effect to redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Function to check if the user has a profile
  const checkProfile = async () => {
    if (!user) return;
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        // Profile doesn't exist or error occurred, redirect to profile setup
        router.push("/profile-setup");
      }
    } catch (err) {
      console.error("Error checking profile:", err);
      setError("Failed to check profile.");
    }
  };

  //fetch readings
  const fetchReadings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReadings(data);
      // Update current readings count
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("readings_count")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setCurrentReadings(profile.readings_count);
    } catch (err) {
      console.error("Error fetching readings:", err);
      setError("Failed to load readings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentReadingsCount = async () => {
    if (!user) return;
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("readings_count")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setCurrentReadings(profile.readings_count);
    } catch (err) {
      console.error("Error fetching current readings count:", err);
      setError("Failed to load current readings count.");
    }
  };

  // Effect to check profile and fetch readings
  useEffect(() => {
    if (!authLoading && user) {
      checkProfile();
      fetchReadings();
      fetchCurrentReadingsCount();
    }
  }, [user, authLoading]);

  // New function to handle fortune calculation
  const requestNewReading = async () => {
    // Check if the user has reached the reading limit
    if (currentReadings >= READING_LIMIT) {
      setError(`Free reading limit (${READING_LIMIT}) reached.`);
      return;
    }

    setRequestingReading(true);
    setError(null);
    setMessage(null);
    setFortuneResult(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const response = await fetch("/api/get-fortune", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const fortuneData = await response.json();
      setFortuneResult(fortuneData);
      setMessage("New reading generated successfully!");
      // Update current readings count
      setCurrentReadings((prev) => prev + 1);
      // Refresh the readings list
      const { data, error } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReadings(data);
    } catch (err) {
      console.error("Error requesting new reading:", err);
      setError(err.message);
    } finally {
      setRequestingReading(false);
    }
  };

  // Existing logout handler...
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Loading states...
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  // Determine if fortune calculation should be enabled
  const canCalculate = currentReadings < READING_LIMIT;
  const limitReached = currentReadings >= READING_LIMIT;

  const renderReadings = () => {
    return (
      <ul className="space-y-4">
        {readings.map((reading) => (
          <li key={reading.id} className="bg-white p-4 rounded-lg shadow-md">
            <Link href={`/readings/basic/${reading.id}`}>
              {/* <h3 className="font-medium">{reading.weton_details.weton}</h3> */}
              <p className="text-sm text-gray-600">
                {new Date(reading.created_at).toLocaleDateString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  const renderFortuneResult = () => {
    return (
      <div className="mt-4 space-y-4">
        {/* Weton Details Card */}
        <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
          <h3 className="text-sm font-semibold text-indigo-800 mb-1">
            Your Weton Details
          </h3>
          <p className="text-xs text-indigo-700">
            Weton:{" "}
            <span className="font-medium">
              {fortuneResult.wetonDetails.weton}
            </span>
          </p>
          <p className="text-xs text-indigo-700">
            Total Neptu:{" "}
            <span className="font-medium">
              {fortuneResult.wetonDetails.totalNeptu}
            </span>
            <span className="text-gray-600">
              {" "}
              (Day {fortuneResult.wetonDetails.dayNeptu} + Pasaran{" "}
              {fortuneResult.wetonDetails.pasaranNeptu})
            </span>
          </p>
        </div>

        {/* AI Analysis Card */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            AI Fortune Analysis
          </h3>
          {/* Format the AI analysis text */}
          <div className="prose prose-sm text-gray-700 max-w-none">
            {fortuneResult.analysis.split("\n").map((paragraph, index) => (
              // Render paragraphs, handle potential list formatting from AI
              <p key={index} className="mb-2">
                {paragraph.replace(/^\d+\.\s*/, "")}
              </p> // Basic paragraph splitting, remove leading numbers if AI adds them
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => {
    return (
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Calculating your fortune, please wait...
        </p>
        {/* Optional: add a spinner */}
      </div>
    );
  };

  const renderErrorState = () => {
    return (
      <p className="mt-3 text-xs text-red-700 bg-red-100 p-2 rounded">
        {error}
      </p>
    );
  };

  const renderSuccessState = () => {
    return <p className="text-green-600 mb-4">{message}</p>;
  };

  return (
    // Existing Layout Wrapper (from _app.js) handles the mobile view
    <div className="p-4 sm:p-6">
      {" "}
      {/* Add padding inside the main content area */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">
          Weton AI Dashboard
        </h1>
        <div className="text-center sm:text-right text-xs sm:text-sm">
          <span className="block sm:inline mr-0 sm:mr-4 mb-1 sm:mb-0 text-gray-600">
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
          >
            Logout
          </button>
        </div>
      </header>
      {/* Weton Fortune Section - Updated */}
      <div className="bg-white p-4 sm:p-6 rounded shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 border-b pb-2">
          Weton Fortune
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Readings used: {currentReadings} / {READING_LIMIT}
        </p>
        {error && renderErrorState()}
        {message && renderSuccessState()}
        {loading ? (
          <p>Loading readings...</p>
        ) : readings.length === 0 ? (
          <p>No readings found.</p>
        ) : (
          renderReadings()
        )}
        {/* Button to trigger calculation */}
        {!fortuneResult && (
          <button
            onClick={requestNewReading}
            disabled={!canCalculate || requestingReading}
            className={`w-full px-4 py-2 rounded text-white font-semibold text-sm transition duration-150 ease-in-out ${
              canCalculate
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            } ${requestingReading ? "opacity-50 cursor-wait" : ""}`}
          >
            {requestingReading
              ? "Generating new reading..."
              : "Get New Reading"}
          </button>
        )}

        {/* Status/Error Messages */}
        {!requestingReading && !canCalculate && limitReached && (
          <p className="mt-3 text-xs text-red-700 bg-red-100 p-2 rounded">
            You have reached your free reading limit.
          </p>
        )}

        {/* Loading State */}
        {requestingReading && renderLoadingState()}

        {/* Display Fortune Result */}
        {fortuneResult && !requestingReading && renderFortuneResult()}
      </div>
    </div>
  );
}
