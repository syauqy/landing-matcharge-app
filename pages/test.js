// pages/test.js
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { getWuku } from "@/utils";

export default function TestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [birthDate, setBirthDate] = useState("");
  const [wuku, setWuku] = useState({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleTestModels = async () => {
    setLoading(true);
    setError(null);
    setResults({});

    const models = [
      "gemini-1.5-flash",
      // "gemini-1.5-flash-8b",
      // "gemini-2.5-pro-preview-03-25",
      "gemini-2.0-flash",
    ];

    const newResults = {};

    try {
      for (const model of models) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("No active session");
        }

        const response = await fetch("/api/get-test", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            "x-model-override": model,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }

        const data = await response.json();
        newResults[model] = data; // Store the entire data object
      }
      setResults(newResults);
    } catch (err) {
      console.error("Error testing models:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWuku = () => {
    const wuku_data = getWuku(birthDate);
    setWuku(wuku_data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const testAISDK = async () => {
    setLoading(true); // Add loading state handling
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const response = await fetch("/api/ai-test", {
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

      console.log(response);

      const data = await response.json();
      setResults(data); // Store the entire data object
    } catch (err) {
      console.error("Error testing AI SDK:", err); // Store the entire data object
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  console.log(wuku, birthDate);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Test AI Models</h1>
      <button
        onClick={handleTestModels}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50"
      >
        {loading ? "Testing Models..." : "Test Models"}
      </button>
      <button
        onClick={testAISDK}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50"
      >
        {loading ? "Testing Models..." : "Test AI SDK"}
      </button>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading && (
        <div className="text-gray-500 mb-4">Testing models, please wait...</div>
      )}

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
        <button onClick={handleTestWuku}>Get Wuku</button>
        <p className="text-xs text-gray-500 mt-2">
          Required for Weton calculation
        </p>
        <p>Your Wuku: {wuku.wuku}</p>
      </div>

      {/* Optionally display AI SDK result if you store it in state */}
      {results.analysis && (
        <div className="border p-4 rounded-md mt-4">
          <h2 className="font-bold">Weton Analysis</h2>
          <pre>{JSON.stringify(results.analysis, null, 2)}</pre>
        </div>
      )}

      {/* {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          {Object.entries(results).map(([model, data]) => (
            <div key={model} className="border p-4 rounded-md">
              <h2 className="font-bold">{model}</h2>
              {data.wetonDetails && (
                <div className="mt-2">
                  <p>
                    <strong>Weton:</strong> {data.wetonDetails.weton}
                  </p>
                  <p>
                    <strong>Total Neptu:</strong> {data.wetonDetails.totalNeptu}
                  </p>
                </div>
              )}
              <div className="prose prose-sm mt-2">
                {data.analysis.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
