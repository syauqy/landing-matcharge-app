import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useQueryState } from "nuqs";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Markdown from "markdown-to-jsx";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown
import {
  fetchProfileData,
  handleGenerateReading,
  fetchReading,
} from "@/utils/fetch";
import { ErrorLayout } from "@/components/layouts/error-page";
import { NoProfileLayout } from "@/components/readings/no-profile-layout";
import { PageLoadingLayout } from "@/components/readings/page-loading-layout";
import { Capacitor } from "@capacitor/core";
import { ReadingLoading } from "@/components/readings/reading-loading";
import { ReadingDescription } from "@/components/readings/reading-description";
import { ReadingNavbar } from "@/components/readings/reading-navbar";
import { FeedbackSession } from "@/components/readings/feedback-section";
import { ContentSection } from "@/components/readings/content-section";
import { DisclaimerSection } from "@/components/readings/disclaimer-section";

export default function DetailCompatibilityReading() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showTitleInNavbar, setShowTitleInNavbar] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slug, setSlug] = useQueryState("slug");
  const [reading, setReading] = useState(null);
  const [isSectionOneOpen, setIsSectionOneOpen] = useState(true);
  const [isSectionTwoOpen, setIsSectionTwoOpen] = useState(false);
  const [isSectionThreeOpen, setIsSectionThreeOpen] = useState(false);
  const [isSectionFourOpen, setIsSectionFourOpen] = useState(false);
  const [isSectionFiveOpen, setIsSectionFiveOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Or your app's login page
      return;
    }

    if (!router.isReady || !user) {
      setLoading(true);
      return;
    }

    fetchProfileData({ user, setLoading, setError, setProfileData });
  }, []);

  const fetchReading = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("readings")
        .select("id, status, reading, title, subtitle, reading_category") // Ensure reading_category is fetched if needed for other logic
        .eq("slug", slug) // Match the username column with the slug
        .single();

      if (error) {
        console.error("Error fetching reading data:", error);
        return;
      }

      if (data) {
        setReading(data);
      }
    } catch (error) {
      console.error("Error in fetchReading:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  function convertToMarkdownList(text) {
    // Replace numbers with newline + number if not at the beginning
    let formatted = text.replace(/(\s+)(\d+\.)/g, "\n$2");

    // If the text doesn't start with a number, clean up any initial newline
    if (!/^\d+\./.test(formatted)) {
      formatted = formatted.replace(/^\n/, "");
    }

    return formatted;
  }

  useEffect(() => {
    fetchReading();
  }, [fetchReading]);

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

  if (authLoading || (loading && !error)) {
    return <PageLoadingLayout />;
  }

  if (!profileData) {
    return (
      <NoProfileLayout
        router={router}
        profileData={profileData}
        showTitleInNavbar={showTitleInNavbar}
      />
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
  console.log(user);

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
                {reading.title.replace(/'s Compatibility$/, "")}
              </span>
            </div>
          )}
          <div className="navbar-end"></div>
        </div>

        {error && <ErrorLayout error={error} router={router} />}

        <main className="p-5 bg-base-100 md:p-6 max-w-3xl mx-auto space-y-6 pb-16">
          {/* <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-batik-black mb-2">
              {reading.title || "Compatibility Reading"}
            </h1>
            {reading.header && (
              <p className="text-md text-gray-600">{reading.header}</p>
            )}
          </header> */}

          {reading.status === "completed" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-left">
                  {reading.title || "Compatibility Reading"}
                </h2>
              </div>
              <section className={"pt-4 flex flex-col"}>
                <div className="font-semibold text-batik-text">
                  Couple Archetype
                </div>
                <h2 className="text-lg font-semibold">
                  {readingContent?.summary?.archetype}
                </h2>
                <div className="text-gray-700">
                  {readingContent?.summary?.essence}
                </div>
              </section>
              <ContentSection
                reading={convertToMarkdownList(
                  readingContent?.summary?.strengths
                )}
                setIsSectionOpen={setIsSectionOneOpen}
                isSectionOpen={isSectionOneOpen}
                title="🟢 Your Green Flags"
                firstSection={true}
              />
              <ContentSection
                reading={convertToMarkdownList(
                  readingContent?.summary?.challenges
                )}
                setIsSectionOpen={setIsSectionTwoOpen}
                isSectionOpen={isSectionTwoOpen}
                title="💪 Your Growth Edges"
              />
              <ContentSection
                reading={readingContent?.insight}
                setIsSectionOpen={setIsSectionThreeOpen}
                isSectionOpen={isSectionThreeOpen}
                title="💡 Advice for You"
              />
            </div>
          ) : reading.status === "loading" ? (
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
                  {readingContent?.header}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent?.insight}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent?.analysis?.dynamics}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent?.analysis?.home}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent?.analysis?.passion}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent?.analysis?.challenges}
                </ReactMarkdown>
              </article>
              <article className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingContent?.analysis?.advice}
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
