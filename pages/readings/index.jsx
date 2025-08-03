// pages/readings/index.js
import Head from "next/head";
import { useEffect, useState } from "react"; // Import useEffect
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useRouter } from "next/router"; // Import useRouter// Import Navbar
import { Menubar } from "@/components/layouts/menubar";
import { SectionData } from "@/utils/readings-menu";
import { Navbar } from "@/components/layouts/navbar";
import Link from "next/link";
import clsx from "clsx";

// Placeholder data for cards (replace with your actual data source)

// Reusable Card Component - Updated Styling
const ReadingCard = ({ title, description, slug, category, type }) => (
  <Link
    href={"/readings/" + category + "/" + slug}
    className="relative snap-center active:bg-batik focus:bg-batik snap-always flex-shrink-0 w-40 sm:w-64 bg-white rounded-2xl shadow p-4 border border-batik-border transition-shadow duration-200 h-32 flex flex-col justify-between"
  >
    <div className="mt-2">
      <h3 className="text-sm font-semibold mb-1 leading-5 text-gray-800">
        {title}
      </h3>
      <p className="text-xs text-gray-600 line-clamp-3">{description}</p>
    </div>
    {type === "pro" && (
      <div className="absolute rounded-xl px-3 py-0.5 z-10 font-semibold bg-amber-400 text-[10px] top-1 right-1 text-batik-black">
        PRO
      </div>
    )}
  </Link>
);

// Reusable Section Component - Updated Styling
const ReadingSection = ({ title, cards, subtitle, tag }) => (
  <section className="mb-6 scroll-mt-30" id={tag}>
    <div className="mb-3 px-5">
      <h2 className="text-xl font-semibold  text-batik-black">{title}</h2>
      <h3 className="font-light text-batik-black text-sm">{subtitle}</h3>
    </div>
    <div className="flex flex-row flex-wrap gap-3 pb-4 px-5">
      {cards.map((card) => (
        <ReadingCard
          key={card.id}
          title={card.title}
          description={card.description}
          slug={card.slug}
          category={card.category}
          type={card.type}
        />
      ))}
    </div>
  </section>
);

export default function ReadingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // This code runs only on the client, where `window` is available.
    const getHash = () => window.location.hash.substring(1);
    setActiveHash(getHash());

    const handleHashChange = () => {
      setActiveHash(getHash());
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount.
  // --- Loading States ---
  if (authLoading) {
    return (
      <div className=" min-h-screen flex items-center justify-center bg-batik">
        <p className="text-batik-black">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Readings - Wetonscope</title>
        <meta
          name="description"
          content="Explore various readings for insights."
        />
      </Head>
      <div className="min-h-screen flex flex-col bg-base relative select-none">
        <Navbar title="Readings" />
        <div className="flex flex-row gap-3 flex-nowrap overflow-scroll sticky top-15 left-0 z-30 py-2">
          {SectionData?.map((section, i) => (
            <Link
              href={`#${section?.tag}`}
              className={clsx(
                "py-2.5 first:ml-3 last:mr-3 p-5 shrink-0 rounded-full text-sm shadow",
                activeHash == section?.tag
                  ? "bg-rose-50 border border-rose-100"
                  : "bg-base-100 border border-batik-border"
              )}
              key={i}
            >
              {section?.title}
            </Link>
          ))}
        </div>
        <div className="px-safe flex flex-col bg-base pt-4 sm:pt-6 pb-20">
          <div className="py- sm:py-6">
            <div className="space-y-6">
              {SectionData.map((section, i) => (
                <ReadingSection
                  key={i}
                  title={section.title}
                  subtitle={section.subtitle}
                  cards={section.cards}
                  tag={section.tag}
                />
              ))}
            </div>
          </div>

          <Menubar page={"readings"} />
        </div>
      </div>
    </>
  );
}
