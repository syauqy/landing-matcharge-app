// pages/compatibility/custom.js
import Head from "next/head";
import { useState } from "react";
import { config } from "@/utils/config";
import { Navbar } from "@/components/layouts/navbar";
import { Loader2 } from "lucide-react";
import { getWuku, getWeton, getWetonJodoh } from "@/utils";

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

export default function CompatibilityPage() {
  // Input states
  const [p1Name, setP1Name] = useState("");
  const [p1Date, setP1Date] = useState("");
  const [p2Name, setP2Name] = useState("");
  const [p2Date, setP2Date] = useState("");

  // Result states
  const [partner1Data, setPartner1Data] = useState(null);
  const [partner2Data, setPartner2Data] = useState(null);
  const [wetonJodoh, setWetonJodoh] = useState(null);
  const [compatibilityReading, setCompatibilityReading] = useState(null);
  const [coupleReading, setCoupleReading] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false); // For main calculation
  const [loadingLoveReading, setLoadingLoveReading] = useState(false);
  const [loadingCoupleReading, setLoadingCoupleReading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError(null);
    setPartner1Data(null);
    setPartner2Data(null);
    setWetonJodoh(null);
    setCompatibilityReading(null);
    setCoupleReading(null);

    if (!p1Name || !p1Date || !p2Name || !p2Date) {
      setError("Please fill in all fields for both partners.");
      return;
    }

    setLoading(true);
    try {
      // Use a short timeout to allow UI to update before heavy calculation
      await new Promise((res) => setTimeout(res, 50));

      const p1Weton = getWeton(p1Date);
      const p1Wuku = getWuku(p1Date);
      if (!p1Weton || !p1Wuku)
        throw new Error("Invalid birth date for Partner 1.");
      const p1Profile = {
        full_name: p1Name,
        birth_date: p1Date,
        weton: p1Weton,
        wuku: p1Wuku,
        dina_pasaran: p1Weton.weton,
      };
      setPartner1Data(p1Profile);

      const p2Weton = getWeton(p2Date);
      const p2Wuku = getWuku(p2Date);
      if (!p2Weton || !p2Wuku)
        throw new Error("Invalid birth date for Partner 2.");
      const p2Profile = {
        full_name: p2Name,
        birth_date: p2Date,
        weton: p2Weton,
        wuku: p2Wuku,
        dina_pasaran: p2Weton.weton,
      };
      setPartner2Data(p2Profile);

      const jodohResult = getWetonJodoh(p1Profile, p2Profile);
      setWetonJodoh(jodohResult);
    } catch (err) {
      console.error("Calculation error:", err);
      setError(
        err.message ||
          "Could not calculate compatibility. Please check the birth dates."
      );
    } finally {
      setLoading(false);
    }
  };

  console.log(wetonJodoh);

  const handleLoveReading = async () => {
    if (!partner1Data || !partner2Data || !wetonJodoh) return;
    setError(null);
    setLoadingLoveReading(true);
    setCompatibilityReading(null);

    try {
      const response = await fetch(`${config.api.url}/compatibility/love`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile1: partner1Data,
          profile2: partner2Data,
          wetonJodoh: wetonJodoh,
        }),
        credentials: "include",
      });

      const readingData = await response.json();
      if (!response.ok) {
        throw new Error(
          readingData.message || "Failed to generate love reading."
        );
      }
      setCompatibilityReading(readingData);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoadingLoveReading(false);
    }
  };

  const handleCoupleReading = async () => {
    if (!partner1Data || !partner2Data || !wetonJodoh) return;
    setError(null);
    setLoadingCoupleReading(true);
    setCoupleReading(null);

    try {
      const response = await fetch(`${config.api.url}/compatibility/couple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile1: partner1Data,
          profile2: partner2Data,
          wetonJodoh: wetonJodoh,
        }),
        credentials: "include",
      });

      const readingData = await response.json();
      if (!response.ok) {
        throw new Error(
          readingData.message || "Failed to generate couple dynamics reading."
        );
      }
      setCoupleReading(readingData);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoadingCoupleReading(false);
    }
  };

  const isCalculateDisabled =
    !p1Name || !p1Date || !p2Name || !p2Date || loading;
  return (
    <>
      <Head>
        <title>Weton Jodoh Compatibility - Wetonscope</title>
        <meta
          name="description"
          content="Calculate your Weton Jodoh compatibility with your partner."
        />
      </Head>

      {/* --- Main Layout Container --- */}
      <div className="min-h-screen flex flex-col bg-base-100">
        <Navbar isBack={true} title="Weton Jodoh" />
        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto justify-center pt-4 sm:pt-6 pb-20 px-5">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center text-batik-black mb-2">
              Weton Jodoh Compatibility
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Enter the names and birth dates of two people to discover their
              Javanese compatibility reading.
            </p>

            <form onSubmit={handleCalculate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
                {/* Partner 1 Form */}
                <div className="card bg-base-100 shadow-sm border border-base-300 p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-4 text-batik-black">
                    Partner 1
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="p1Name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="p1Name"
                        value={p1Name}
                        onChange={(e) => setP1Name(e.target.value)}
                        className="input input-bordered w-full text-base"
                        required
                        placeholder="e.g. Budi Santoso"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="p1Date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Birth Date
                      </label>
                      <input
                        type="date"
                        id="p1Date"
                        value={p1Date}
                        onChange={(e) => setP1Date(e.target.value)}
                        className="input input-bordered w-full text-base"
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Partner 2 Form */}
                <div className="card bg-base-100 shadow-sm border border-base-300 p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-4 text-batik-black">
                    Partner 2
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="p2Name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="p2Name"
                        value={p2Name}
                        onChange={(e) => setP2Name(e.target.value)}
                        className="input input-bordered w-full text-base"
                        required
                        placeholder="e.g. Siti Aminah"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="p2Date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Birth Date
                      </label>
                      <input
                        type="date"
                        id="p2Date"
                        value={p2Date}
                        onChange={(e) => setP2Date(e.target.value)}
                        className="input input-bordered w-full text-base"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-primary btn-wide"
                  disabled={isCalculateDisabled}
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Calculate Compatibility"
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            {wetonJodoh && partner1Data && partner2Data && (
              <div className="mt-10 space-y-6">
                {/* Results Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="bg-base-100 rounded-lg p-4 md:p-6 border border-base-300">
                    <h3 className="text-lg font-semibold mb-3">
                      {partner1Data.full_name}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <DetailItem
                        label="Dina Pasaran"
                        value={partner1Data.dina_pasaran}
                        isBold
                      />
                      <DetailItem
                        label="Wuku"
                        value={partner1Data.wuku?.name}
                      />
                      <DetailItem
                        label="Total Neptu"
                        value={partner1Data.weton?.total_neptu}
                      />
                    </div>
                  </div>
                  <div className="bg-base-100 rounded-lg p-4 md:p-6 border border-base-300">
                    <h3 className="text-lg font-semibold mb-3">
                      {partner2Data.full_name}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <DetailItem
                        label="Dina Pasaran"
                        value={partner2Data.dina_pasaran}
                        isBold
                      />
                      <DetailItem
                        label="Wuku"
                        value={partner2Data.wuku?.name}
                      />
                      <DetailItem
                        label="Total Neptu"
                        value={partner2Data.weton?.total_neptu}
                      />
                    </div>
                  </div>
                </div>

                {/* Weton Jodoh Results */}
                <div className="bg-base-100 rounded-lg p-4 md:p-6 border border-base-300">
                  <h3 className="text-lg font-semibold mb-3 text-center">
                    Weton Jodoh Result
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-gray-500 text-sm">Division 4</p>
                      <p className="font-semibold text-batik-black">
                        {wetonJodoh.jodoh4?.name}
                      </p>
                      <p className="text-sm text-batik-black">
                        {wetonJodoh.jodoh4?.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Division 5</p>
                      <p className="font-semibold text-batik-black">
                        {wetonJodoh.jodoh5?.name}
                      </p>
                      <p className="text-sm text-batik-black">
                        {wetonJodoh.jodoh5?.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Division 7</p>
                      <p className="font-semibold text-batik-black">
                        {wetonJodoh.jodoh7?.name}
                      </p>
                      <p className="text-sm text-batik-black">
                        {wetonJodoh.jodoh7?.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Division 8</p>
                      <p className="font-semibold text-batik-black">
                        {wetonJodoh.jodoh8?.name}
                      </p>
                      <p className="text-sm text-batik-black">
                        {wetonJodoh.jodoh8?.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">
                        Based on Division 9 of each partner
                      </p>
                      <p className="font-semibold text-batik-black">
                        {wetonJodoh.jodoh9?.weton1} - {wetonJodoh.jodoh9.weton2}
                      </p>
                      <p className="text-sm text-batik-black">
                        {wetonJodoh.jodoh9?.result}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">
                        Based on Day of Birth
                      </p>
                      <p className="font-semibold text-batik-black">
                        {wetonJodoh.jodohDay?.dina1} -{" "}
                        {wetonJodoh.jodohDay.dina2}
                      </p>
                      <p className="text-sm text-batik-black">
                        {wetonJodoh.jodohDay?.result}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Readings Section */}
                {/* <div className="text-center space-y-4 md:space-y-0 md:space-x-4">
                  <button
                    onClick={handleLoveReading}
                    className="btn btn-accent"
                    disabled={loadingLoveReading || loadingCoupleReading}
                  >
                    {loadingLoveReading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      "Get Love Reading"
                    )}
                  </button>
                  <button
                    onClick={handleCoupleReading}
                    className="btn btn-secondary"
                    disabled={loadingLoveReading || loadingCoupleReading}
                  >
                    {loadingCoupleReading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      "Get Couple Dynamics Reading"
                    )}
                  </button>
                </div> */}

                {compatibilityReading && (
                  <div className="border p-4 rounded-md mt-4 bg-base-100">
                    <h2 className="font-bold text-lg mb-2">
                      Love Compatibility Reading
                    </h2>
                    {compatibilityReading.status === "pending" ? (
                      <div className="text-center p-4">
                        <span className="loading loading-dots loading-md"></span>
                        <p className="text-sm text-gray-500 mt-2">
                          Reading is being generated... please wait.
                        </p>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                        {JSON.stringify(compatibilityReading.reading, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {coupleReading && (
                  <div className="border p-4 rounded-md mt-4 bg-base-100">
                    <h2 className="font-bold text-lg mb-2">
                      Couple Dynamics Reading
                    </h2>
                    {coupleReading.status === "pending" ? (
                      <div className="text-center p-4">
                        <span className="loading loading-dots loading-md"></span>
                        <p className="text-sm text-gray-500 mt-2">
                          Reading is being generated... please wait.
                        </p>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                        {JSON.stringify(coupleReading.reading, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
