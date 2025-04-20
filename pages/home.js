// pages/dashboard.jsx
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";
import { Menubar } from "@/components/layouts/menubar";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [requestingReading, setRequestingReading] = useState(false);
  const [fortuneResult, setFortuneResult] = useState(null);
  const [currentReadings, setCurrentReadings] = useState(0);
  const [latestReadings, setLatestReadings] = useState([]);

  const READING_LIMIT = 2;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
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

  const fetchLatestReadings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setLatestReadings(data);
    } catch (err) {
      console.error("Error fetching latest readings:", err);
      setError("Failed to load latest readings.");
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      checkProfile();
      fetchLatestReadings();
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

      const response = await fetch(
        "https://weton-ai-next.vercel.app/api/get-fortune",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

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
      fetchLatestReadings();
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

  const renderLatestReadings = () => {
    console.log(latestReadings);
    return (
      <ul className="space-y-4">
        {latestReadings.map((r) => (
          <li
            key={r.id}
            className="bg-white p-4 rounded-lg shadow-sm border-batik-border h-20 w-fit"
          >
            <Link href={`/readings/${r?.reading_category}/${r.slug}`}>
              <p className="text-sm text-gray-600 font-semibold">{r.title}</p>
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

  // const renderLoadingState = () => {
  //   return (
  //     <div className="mt-4 text-center">
  //       <p className="text-sm text-gray-600">
  //         Calculating your fortune, please wait...
  //       </p>
  //     </div>
  //   );
  // };

  // const renderErrorState = () => {
  //   return (
  //     <p className="mt-3 text-xs text-red-700 bg-red-100 p-2 rounded">
  //       {error}
  //     </p>
  //   );
  // };

  // const renderSuccessState = () => {
  //   return <p className="text-green-600 mb-4">{message}</p>;
  // };

  return (
    <div className="h-[100svh] flex flex-col bg-batik">
      <DashboardNavbar user={user} handleLogout={handleLogout} />
      <div className="py-4 sm:py-6 flex-grow my-12">
        <div className="flex flex-col gap-2">
          <div className="px-4 text-lg font-medium text-batik-black">
            Daily reading
          </div>
          <div className="px-4">{renderReadings()}</div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="px-4 text-lg font-medium text-batik-black">
            Latest readings
          </div>
          <div className="px-4">{renderLatestReadings()}</div>
        </div>
        <Menubar />
      </div>
    </div>
  );
}
