// pages/dashboard.jsx
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import { HomeIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { CrystalBall } from "@/components/icons";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [requestingReading, setRequestingReading] = useState(false);
  const [fortuneResult, setFortuneResult] = useState(null);
  const [currentReadings, setCurrentReadings] = useState(0);

  const READING_LIMIT = 2;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const checkProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        router.push("/profile-setup");
      }
    } catch (err) {
      console.error("Error checking profile:", err);
      setError("Failed to check profile.");
    }
  };

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

  useEffect(() => {
    if (!authLoading && user) {
      checkProfile();
    }
  }, [user, authLoading]);

  const requestNewReading = async () => {
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
      setCurrentReadings((prev) => prev + 1);
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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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

  const canCalculate = currentReadings < READING_LIMIT;
  const limitReached = currentReadings >= READING_LIMIT;

  const renderReadings = () => {
    return (
      <ul className="space-y-4">
        {readings.map((reading) => (
          <li key={reading.id} className="bg-white p-4 rounded-lg shadow-md">
            <Link href={`/readings/basic/${reading.id}`}>
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

        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            AI Fortune Analysis
          </h3>
          <div className="prose prose-sm text-gray-700 max-w-none">
            {fortuneResult.analysis.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-2">
                {paragraph.replace(/^\d+\.\s*/, "")}
              </p>
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
    <div className="h-[100svh] flex flex-col bg-batik">
      <nav className="bg-batik w-full px-4 py-2 fixed top-0 left-0 z-10 border-b border-batik-border">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-center w-full text-batik-black">
            Wetonscope
          </h1>
          {/* <div className="text-center sm:text-right text-xs sm:text-sm">
            <span className="block sm:inline mr-0 sm:mr-4 mb-1 sm:mb-0 text-gray-600">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
            >
              Logout
            </button>
          </div> */}
        </div>
      </nav>
      <div className="p-4 sm:p-6 flex-grow mt-12">
        <div className="flex flex-col">
          <div>Daily Reading</div>
          <div>Daily</div>
        </div>
        <div>
          <div>Latest Readings</div>
          <div>Latest</div>
        </div>
        {/* <div className="bg-white p-4 sm:p-6 rounded shadow-md">
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
          {!requestingReading && !canCalculate && limitReached && (
            <p className="mt-3 text-xs text-red-700 bg-red-100 p-2 rounded">
              You have reached your free reading limit.
            </p>
          )}
          {requestingReading && renderLoadingState()}
          {fortuneResult && !requestingReading && renderFortuneResult()}
        </div> */}
      </div>
      <nav className="bg-batik w-full px-4 py-1.5 fixed bottom-0 left-0 inset-shadow-2xs border-t border-batik-border">
        <ul className="flex justify-around">
          <li>
            <Link
              href="/dashboard"
              className="text-batik-text flex flex-col items-center"
            >
              <HomeIcon className="h-6 w-6" />
              <span className="mt-0.5 text-xs font-medium">Home</span>
            </Link>
          </li>
          <li>
            <Link
              href="/readings"
              className="text-batik-text flex flex-col items-center"
            >
              <CrystalBall className="h-6 w-6" />
              <span className="mt-0.5 text-xs font-medium">Readings</span>
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="text-batik-text flex flex-col items-center"
            >
              <UserCircleIcon className="h-6 w-6" />
              <span className="mt-0.5 text-xs font-medium">Profile</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
