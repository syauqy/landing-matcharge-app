import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown

export default function DetailCompatibilityReading({ reading }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);

  // Redirect if not authenticated (though data is fetched server-side, good for consistency)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Or your app's login page
    }
  }, [user, authLoading, router]);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    // Adjust the scroll threshold as needed
    setShowTitleInNavbar(scrollPosition > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  // The reading prop is guaranteed by getServerSideProps if no error/notFound
  if (!reading) {
    // This should ideally not be reached if getServerSideProps is correct
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content p-4">
        <p>Reading not found.</p>
        <button onClick={() => router.back()} className="btn btn-neutral mt-6">
          Go Back
        </button>
      </div>
    );
  }

  const readingContent = reading.reading?.reading || reading.reading; // Handle if reading.reading is an object or string
  console.log(reading.reading);

  return (
    <>
      <Head>
        <title>{reading.title || "Compatibility Reading"} - Wetonscope</title>
        <meta
          name="description"
          content={
            reading.subtitle ||
            `Detailed compatibility reading: ${reading.title}`
          }
        />
      </Head>
      <div className="min-h-screen bg-base-100 text-base-content font-sans">
        <div
          className={`navbar px-5 bg-base-100 sticky top-0 z-50 transition-all duration-300 ${
            showTitleInNavbar ? "border-b border-batik-border" : ""
          }`}
        >
          <div className="navbar-start">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full text-xl border border-batik-text hover:bg-base-200"
            >
              <ArrowLeft size={20} className="text-batik-text" />
            </button>
          </div>
          {showTitleInNavbar && (
            <div className="navbar-center flex-col">
              <div className="text-xs text-batik-text font-semibold uppercase">
                Compatibility
              </div>
              <span className="text-batik-black font-semibold text-sm truncate max-w-xs">
                {reading.title}
              </span>
            </div>
          )}
          <div className="navbar-end"></div>
        </div>

        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-batik-black mb-2">
              {reading.title || "Compatibility Reading"}
            </h1>
            {reading.subtitle && (
              <p className="text-md text-gray-600">{reading.subtitle}</p>
            )}
          </header>

          {reading.status === "pending" ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-base-200 rounded-lg">
              <Loader2 className="animate-spin h-12 w-12 text-batik-black mb-4" />
              <p className="text-lg font-semibold text-batik-black">
                This reading is still being generated.
              </p>
              <p className="text-sm text-gray-600">
                Please check back in a few moments.
              </p>
            </div>
          ) : readingContent ? (
            <div className="flex flex-col gap-4">
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent.insight}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent.analysis.foundational}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent.analysis.dynamics}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent.analysis.home}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent.analysis.passion}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent.analysis.challenges}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent.analysis.advice}
                </ReactMarkdown>
              </article>
            </div>
          ) : (
            <p className="text-gray-500">
              No reading content available for this entry.
            </p>
          )}
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;

  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    return { notFound: true }; // Invalid slug
  }

  // Fetch profile data from Supabase 'profiles' table
  // Assumes your 'profiles' table has a 'username' column that matches the slug
  const { data: reading, error } = await supabase
    .from("readings")
    .select("id, status, reading, title, subtitle, reading_category") // Ensure reading_category is fetched if needed for other logic
    .eq("slug", slug) // Match the username column with the slug
    .single(); // Expect a single record

  if (error) {
    // .single() throws an error if 0 or >1 rows are found.
    // This typically means the profile was not found or there's a data integrity issue (e.g. duplicate usernames).
    console.error(
      `Supabase error fetching reading for slug "${slug}":`,
      error.message
    );
    return { notFound: true }; // Triggers a 404 page
  }

  // Although .single() should error if no profile is found,
  // this is an extra check.
  if (!reading) {
    console.warn(
      `Reading data unexpectedly null for slug "${slug}" despite no Supabase error.`
    );
    return { notFound: true };
  }

  return {
    props: {
      reading,
    },
  };
}
