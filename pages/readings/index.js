// pages/readings/index.js
import Head from "next/head";
import { useEffect } from "react"; // Import useEffect
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useRouter } from "next/router"; // Import useRouter
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar"; // Import Navbar
import { Menubar } from "@/components/layouts/menubar";
import { CardData, SectionData } from "@/utils/readings-menu";
import { Navbar } from "@/components/layouts/navbar"; // Import Navbar

// Placeholder data for cards (replace with your actual data source)

// Reusable Card Component - Updated Styling
const ReadingCard = ({ title, description, slug, category, type }) => (
  <a
    href={"/readings/" + category + "/" + slug}
    className="relative snap-center snap-always flex-shrink-0 w-40 sm:w-64 bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 h-32 flex flex-col justify-between"
  >
    <div className="mt-2">
      <h3 className="text-md font-semibold mb-1 leading-5 text-gray-800">
        {title}
      </h3>
      <p className="text-[9px] text-gray-600 line-clamp-3">{description}</p>
    </div>
    {type === "pro" && (
      <div className="absolute rounded-lg px-3 py-0.5 z-10 font-semibold bg-amber-400 text-[10px] top-1 right-1 text-batik-black">
        PRO
      </div>
    )}
  </a>
);

// Reusable Section Component - Updated Styling
const ReadingSection = ({ title, cards, subtitle }) => (
  <section className="mb-6">
    <div className="mb-3 px-5">
      <h2 className="text-xl font-semibold  text-batik-black">{title}</h2>
      <h3 className="font-light text-batik-black text-xs">{subtitle}</h3>
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
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

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
      <Navbar title="Readings" />
      <div className="px-safe flex flex-col bg-base py-4">
        <div className="py- sm:py-6">
          <div className="space-y-6">
            {SectionData.map((section, i) => (
              <ReadingSection
                key={i}
                title={section.title}
                subtitle={section.subtitle}
                cards={section.cards}
              />
            ))}
          </div>
        </div>

        <Menubar page={"readings"} />
      </div>
    </>
  );
}
