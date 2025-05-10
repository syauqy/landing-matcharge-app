// pages/readings/index.js
import Head from "next/head";
import { useEffect } from "react"; // Import useEffect
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useRouter } from "next/router"; // Import useRouter
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar"; // Import Navbar
import { Menubar } from "@/components/layouts/menubar";
import { CardData, SectionData } from "@/utils/readings-menu";

// Placeholder data for cards (replace with your actual data source)

// Reusable Card Component - Updated Styling
const ReadingCard = ({ title, description, slug, category, type }) => (
  // Adjusted styling to potentially match home.js cards more closely
  <a
    href={slug}
    className="relative snap-center snap-always flex-shrink-0 w-40 sm:w-64 bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 h-32 flex flex-col justify-between"
  >
    <div className="mt-2">
      <h3 className="text-md font-semibold mb-1 leading-5 text-gray-800">
        {title}
      </h3>
      <p className="text-xs text-gray-600 line-clamp-3">{description}</p>
    </div>
    {type === "pro" && (
      <div className="absolute rounded-lg px-3 py-0.5 z-10 font-semibold bg-amber-400 text-[10px] top-1 right-1 text-batik-black">
        PRO
      </div>
    )}
    {/* You could add a 'Read More' link or button here */}
    {/* <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 self-start mt-2">Read More</a> */}
  </a>
);

// Reusable Section Component - Updated Styling
const ReadingSection = ({ title, cards, subtitle }) => (
  <section className="mb-6">
    {/* Updated title styling */}
    <div className="mb-3 px-4">
      <h2 className="text-xl font-semibold  text-batik-black">{title}</h2>
      <h3 className="font-light text-batik-black text-xs">{subtitle}</h3>
    </div>

    {/* --- Horizontal Scroll Container --- */}
    {/* <div className="flex snap-x overflow-x-auto space-x-2 pb-4 px-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 ">
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
    </div> */}
    <div className="flex flex-row flex-wrap gap-3 pb-4 px-4">
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
  // --- Add Auth Hooks ---
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // --- Add Auth Effect ---
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // --- Add Logout Handler ---
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // --- Loading States ---
  if (authLoading) {
    return (
      <div className=" min-h-screen flex items-center justify-center bg-batik">
        <p className="text-batik-black">Loading...</p>
      </div>
    );
  }
  // Optional: Redirect state if needed, though useEffect handles it
  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-batik">
  //       <p className="text-batik-black">Redirecting...</p>
  //     </div>
  //   );
  // }

  return (
    <>
      <Head>
        <title>Readings - Wetonscope</title>
        <meta
          name="description"
          content="Explore various readings for insights."
        />
      </Head>

      {/* --- Main Layout Container (Matches home.js) --- */}
      <div className="px-safe flex flex-col bg-batik pb-10">
        {/* --- Navbar --- */}
        {/* <DashboardNavbar user={user} handleLogout={handleLogout} /> */}
        <div className="py-4 sm:py-6">
          {/* --- Page Title --- */}
          <h1 className="text-2xl md:text-3xl font-bold mb-6 px-4 text-batik-black">
            Readings
          </h1>

          {/* --- Sections --- */}
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
