import { NextSeo } from "next-seo";
import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
// import { Navbar } from "@/components/Navbar";
import { Abhaya_Libre } from "next/font/google";
// import { NextSeo } from "next-seo";
import clsx from "clsx";
import { SelfDiscovery, Insight, Love, Door } from "@/components/illustrations";
import { AppStore } from "@/components/icons";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { set } from "date-fns";
import { getWeton, getWuku } from "@/utils";
// import { Link } from "lucide-react";
import Link from "next/link";

const abhaya = Abhaya_Libre({
  weight: "800",
  subsets: ["latin"],
});

export default function Check() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [wetonData, setWetonData] = useState(null);
  const [wukuData, setWukuData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showBirthTimeChecker, setShowBirthTimeChecker] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!birthDate) {
      toast.error("Birth date is required");
      setSaving(false);
      return;
    }

    if (!birthTime) {
      toast.error("Birth time is required");
      setSaving(false);
      return;
    }

    const wetonDetails = getWeton(birthDate, birthTime);
    const wukuDetails = getWuku(birthDate, birthTime);

    if (!wetonDetails || !wukuDetails) {
      toast.error(
        "Failed to calculate Weton or Wuku. Please check your inputs."
      );
      setSaving(false);
      return;
    } else {
      toast.success("Weton and Wuku calculated successfully!");
      setSaving(false);
      setWetonData(wetonDetails);
      setWukuData(wukuDetails);
      return;
    }
  };

  console.log("Weton Data:", wetonData);
  console.log("Wuku Data:", wukuData);

  return (
    <div className="min-h-screen bg-base-100">
      <NextSeo
        title="Wetonscope - Beyond Horoscope"
        description="Discover your soul's blueprint with Wetonscope, a modern guide to ancient Javanese wisdom. Get personalized daily readings, relationship compatibility insights, and deep self-discovery through traditional Weton calculations."
        openGraph={{
          type: "website",
          locale: "en_US",
          url: "https://wetonscope.com/",
          siteName: "Wetonscope",
          title: "Wetonscope - Beyond Horoscope",
          description:
            "Discover your soul's blueprint with Wetonscope. Get personalized daily readings and relationship insights based on ancient Javanese wisdom.",
          images: [
            {
              url: "/wetonscope-app-hero.png",
              width: 1200,
              height: 630,
              alt: "Wetonscope App Preview",
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content:
              "weton calculator, javanese astrology, horoscope, birth date calculator, relationship compatibility, daily reading, self discovery, primbon jawa, astrology",
          },
          {
            name: "application-name",
            content: "Wetonscope",
          },
        ]}
      />
      <Navbar bg={"bg-batik"} page={"check"} />
      <Toaster position="top-center" richColors />
      <div className=" mx-auto p-5 md:p-8 pt-20 bg-gradient-to-b from-batik to-white">
        <h1
          className={clsx(
            "text-5xl font-bold mb-6 text-center",
            abhaya.className
          )}
        >
          Check Your Weton
        </h1>

        <form
          onSubmit={handleSaveProfile}
          className="max-w-lg mx-auto space-y-8 h-[100%] flex flex-col justify-between"
        >
          <div className="h-[100%]">
            <p className="mb-6 text-center text-gray-700 h-[30%] text-sm">
              Please provide your details to get your personalized Weton
              readings.
            </p>
          </div>
          <div className="h-[40%]">
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
              className="w-full px-3 py-2 block border-0 border-b-2 border-batik-border-light text-lg appearance-none"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Required for Weton and Wuku calculation
            </p>
          </div>
          <div className="h-[40%]">
            <label
              className="block text-gray-700 mb-2 font-semibold"
              htmlFor="birthTime"
            >
              Birth Time <span className="text-red-500">*</span>
            </label>
            {!showBirthTimeChecker && (
              <input
                type="time"
                id="customBirthTime"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-3 py-2 block border-0 border-b-2 border-batik-border-light text-lg appearance-none"
                required
              />
            )}
            {/* Checkbox for "I don't know my birth time" */}
            <div className="mt-3">
              <label className="flex items-center gap-2 text-base text-gray-700 has-checked:font-semibold">
                <input
                  className="checkbox border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                  type="checkbox"
                  checked={showBirthTimeChecker === true}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setShowBirthTimeChecker(true);
                      setBirthTime("06:00"); // Default to "I don't know" option
                    } else {
                      setShowBirthTimeChecker(false);
                      setBirthTime(""); // Reset time input
                    }
                  }}
                />
                I don't know my birth time
              </label>
            </div>

            {/* If user doesn't know birth time, show options */}
            {showBirthTimeChecker && (
              <div className="mt-2">
                <label className="block text-sm text-gray-700 mb-2">
                  No exact time? Do you know the vibe?
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <label className="flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                    <input
                      className="radio radio-sm  border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                      type="radio"
                      name="unknownBirthTime"
                      value="06:00"
                      checked={birthTime === "06:00"}
                      onChange={() => setBirthTime("06:00")}
                    />
                    Morning
                  </label>
                  <label className="flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                    <input
                      className="radio radio-sm  border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                      type="radio"
                      name="unknownBirthTime"
                      value="12:00"
                      checked={birthTime === "12:00"}
                      onChange={() => setBirthTime("12:00")}
                    />
                    Afternoon
                  </label>
                  <label className="flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                    <input
                      className="radio radio-sm border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                      type="radio"
                      name="unknownBirthTime"
                      value="20:00"
                      checked={birthTime === "20:00"}
                      onChange={() => setBirthTime("20:00")}
                    />
                    Evening
                  </label>
                  <label className="flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                    <input
                      className="radio radio-sm border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                      type="radio"
                      name="unknownBirthTime"
                      value="22:00"
                      checked={birthTime === "22:00"}
                      onChange={() => setBirthTime("22:00")}
                    />
                    Night
                  </label>
                  <label className="col-span-2 flex items-center has-checked:font-semibold gap-2 text-sm text-gray-700">
                    <input
                      className="radio radio-sm border-slate-300 bg-slate-200 checked:border-rose-500 checked:bg-rose-400 checked:text-white"
                      type="radio"
                      name="unknownBirthTime"
                      value="01:00"
                      checked={birthTime === "01:00"}
                      onChange={() => setBirthTime("01:00")}
                    />
                    Sorry, I have no clue
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pb-8">
            <button
              type="submit"
              disabled={saving || !birthDate || !birthTime}
              className="bg-batik-text/70 text-batik-white font-semibold py-2 px-4 rounded-lg hover:bg-batik-border-hover transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
            >
              {saving ? "Generating your Weton..." : "Check my weton"}
            </button>
          </div>
        </form>
      </div>
      <div className="p-5 grid grid-cols-1 gap-8 max-w-xl mx-auto mb-20">
        {wetonData && (
          <motion.div
            className="h-[65%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-center">
              Your Weton is{" "}
              <div className="text-batik-text">
                {wetonData?.weton_en || "Unknown"}
              </div>
            </h2>
            <Link
              href={`/blog/what-is-weton`}
              className="text-sm text-batik-text underline underline-offset-2 hover:underline mx-auto block w-fit my-2"
            >
              What is Weton?
            </Link>
            <motion.div
              className="card h-fit bg-base-100 rounded-3xl border border-[var(--color-batik-border)] shadow-sm mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="card-body p-4 flex flex-col items-center justify-between">
                <div className="text-center flex flex-col gap-4">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {wetonData?.watak_weton?.archetype || "Unknown"}
                  </h3>
                  <h4 className="text-base text-center font-medium text-slate-700 mb-1">
                    {wetonData?.watak_weton?.vibe || "Unknown"}
                  </h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-3 text-left mb-1">
                      <div className="text-2xl">❇️</div>
                      <div className="text-sm">
                        {wetonData?.watak_weton?.green_flags}
                      </div>
                    </div>
                    <div className="flex flex-row gap-3 text-left">
                      <div className="text-2xl">🚩</div>
                      <div className="text-sm">
                        {wetonData?.watak_weton?.potential_challenges}
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-3 text-sm text-gray-700">
                    <div className="text-left">
                      <div className="flex flex-row items-center justify-between">
                        <h3 className="text-sm font-medium text-batik-text">
                          🎭 Laku
                        </h3>
                        <Link
                          href={`/blog/elemental-persona-laku`}
                          className="text-sm text-batik-text underline underline-offset-2 hover:underline"
                        >
                          What is Laku?
                        </Link>
                      </div>
                      <p className="text-slate-700 text-sm font-semibold">
                        {wetonData?.laku?.name || "Unknown"}{" "}
                        <span className="font-normal">
                          ({wetonData?.laku?.meaning || "Unknown"})
                        </span>
                      </p>
                      <p>{wetonData?.laku?.description || "Unknown"}</p>
                    </div>
                    <div className="text-left">
                      <div className="flex flex-row items-center justify-between">
                        <h3 className="text-sm font-medium text-batik-text">
                          📜 Rakam
                        </h3>
                        <Link
                          href={`/blog/rakam-intro`}
                          className="text-sm text-batik-text underline underline-offset-2 hover:underline"
                        >
                          What is Rakam?
                        </Link>
                      </div>

                      <p className="text-slate-700 text-sm font-semibold">
                        {wetonData?.rakam?.name || "Unknown"}
                      </p>
                      <p>{wetonData?.rakam?.description || "Unknown"}</p>
                    </div>
                    <div className="text-left">
                      <div className="flex flex-row items-center justify-between">
                        <h3 className="text-sm font-medium text-batik-text">
                          🍀 Pancasuda
                        </h3>
                        <Link
                          href={`/blog/pancasuda-factor`}
                          className="text-sm text-batik-text underline underline-offset-2 hover:underline"
                        >
                          What is Pancasuda?
                        </Link>
                      </div>
                      <p className="text-slate-700 text-sm font-semibold">
                        {wetonData?.saptawara?.name || "Unknown"}
                      </p>
                      <p>{wetonData?.saptawara?.description || "Unknown"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {wukuData && (
          <motion.div
            className="h-[65%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-center">
              Your Wuku is{" "}
              <div className="text-batik-text">
                {wukuData?.name || "Unknown"}
              </div>
            </h2>
            <Link
              href={`/blog/what-is-wuku`}
              className="text-sm text-batik-text underline underline-offset-2 hover:underline mx-auto block w-fit my-2"
            >
              What is Wuku?
            </Link>
            <motion.div
              className="card h-fit bg-base-100 rounded-3xl border border-[var(--color-batik-border)] shadow-sm mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="card-body p-4 flex flex-col items-center gap-5">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {wukuData?.name || "Unknown"}
                  </h3>
                  <p className="text-[16px] text-slate-600 line-clamp-[10]">
                    {wukuData?.short_character || "unknown"}
                  </p>
                </div>
                <div className="w-full flex flex-col gap-4 text-sm text-gray-700">
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-batik-text">
                      👑 Guardian Deity
                    </h3>
                    <p className="text-slate-700 text-sm font-semibold">
                      {wukuData?.god || "Unknown"}
                    </p>
                    <p>{wukuData?.god_meaning || "Unknown"}</p>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-batik-text">
                      🌳 Tree Sign
                    </h3>
                    <p className="text-slate-700 text-sm font-semibold">
                      {wukuData?.tree || "Unknown"}
                    </p>
                    <p>{wukuData?.tree_meaning || "Unknown"}</p>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-batik-text">
                      🕊️ Bird Sign
                    </h3>
                    <p className="text-slate-700 text-sm font-semibold">
                      {wukuData?.bird || "Unknown"}
                    </p>
                    <p>{wukuData?.bird_meaning || "Unknown"}</p>
                  </div>
                </div>
                <Link
                  href={`/blog/wuku-guides`}
                  className="text-sm text-batik-text underline underline-offset-2 hover:underline py-3"
                >
                  Learn more about Wuku's Guardian Deity, Tree, and Bird Signs
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      <section className="py-20 bg-gradient-to-b from-white to-batik">
        <div className="container mx-auto px-5 text-center">
          <h2 className="text-4xl font-bold mb-6">
            This is Just the Beginning
          </h2>
          <p className="text-base text-gray-600 mb-2 max-w-2xl mx-auto">
            Your free Weton & Wuku check gives you a glimpse into your energetic
            blueprint. The Wetonscope app goes much deeper, unlocking detailed
            readings on how your unique energy shapes your career, finances,
            love life, and health.
          </p>
          <p className="text-base text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover your compatibility with others, get daily guidance, and
            live a more aligned life.
          </p>
          <div className="flex flex-col gap-3 justify-center lg:justify-start mt-4">
            <div className="text-xs md:text-sm text-gray-500 w-full md:w-1/2 justify-center lg:justify-start mx-auto">
              Wetonscope is coming soon. Join our waitlist to get exclusive
              early access and a special founder's gift on launch day.
            </div>
            <WaitlistForm />
          </div>
        </div>
      </section>
      <Footer bg={"bg-batik"} />
    </div>
  );
}
