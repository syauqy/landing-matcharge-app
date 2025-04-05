import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";

export default function BasicReadingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Your Reading");
  const [error, setError] = useState(null);

  const { id } = router.query; // Get the reading ID from the URL

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchReading = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("readings")
          .select("reading, title")
          .eq("user_id", user.id)
          .single();

        console.log(data, error);

        if (error) throw error;

        // Parse the reading data from text to JSON
        const parsedReading = JSON.parse(data?.reading);
        setReading(parsedReading);
        setTitle(data?.title);
      } catch (err) {
        console.error("Error fetching reading:", err);
        setError("Failed to load reading.");
      } finally {
        setLoading(false);
      }
    };

    fetchReading();
  }, [user, id]);

  //   console.log(reading);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-batik">
      {/* Navbar */}
      <nav className="bg-batik shadow-sm w-full sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between relative">
          <Link href="/dashboard">
            <button className="text-batik-black hover:text-batik-black-hover">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-batik-black capitalize">
            {title}
          </h1>
          <div className="w-6 h-6"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto">
        {loading && <p>Loading reading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {reading && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Watak (Character)
              </h3>
              <h4>{reading?.watak?.title}</h4>
              <p className="text-sm text-gray-700">
                {reading.watak?.description}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Jodoh (Love & Relationships)
              </h3>
              <h4>{reading?.jodoh?.title}</h4>
              <p className="text-sm text-gray-700">
                {reading.jodoh?.description}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Rezeki (Career & Financial Fortune)
              </h3>
              <h4>{reading?.rezeki?.title}</h4>
              <p className="text-sm text-gray-700">
                {reading.rezeki?.description}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Pergaulan (Interactions)
              </h3>
              <h4>{reading?.pergaulan?.title}</h4>
              <p className="text-sm text-gray-700">
                {reading.pergaulan?.description}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Pemikiran (Cognition)
              </h3>
              <h4>{reading?.pemikiran?.title}</h4>
              <p className="text-sm text-gray-700">
                {reading.pemikiran?.description}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Perjalanan Hidup (General Life Outlook)
              </h3>
              <h4>{reading?.perjalanan_hidup?.title}</h4>
              <p className="text-sm text-gray-700">
                {reading.perjalanan_hidup?.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <footer className="bg-batik shadow-sm w-full sticky bottom-0 z-10 inset-shadow-2xs">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between relative">
          Share
        </div>
      </footer>
    </div>
  );
}
