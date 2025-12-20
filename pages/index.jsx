import React from "react";
// import Head from "next/head";
import { Inter } from "next/font/google";
import { NextSeo } from "next-seo";
// import { SoupIcon, ChartNoAxesColumn, Bell } from "lucide-react";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import faqData from "@/data/faq";

const inter = Inter({
  subsets: ["latin"],
});

export default function MatchargeHomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <NextSeo
        title="Matcharge - Find Your Financial Calm"
        description="Matcharge is a beautiful and insightful way to track your recurring bills, visualize your spending, and end the stress of surprise charges."
        openGraph={{
          type: "website",
          locale: "en_US",
          url: "https://matcharge.app/",
          siteName: "Matcharge",
          title: "Matcharge - Find Your Financial Calm",
          description:
            "Track recurring bills, visualize spending, and end surprise charges.",
          images: [
            {
              url: "/matcharge-og-image.png",
              width: 1200,
              height: 630,
              alt: "Matcharge App Preview",
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content:
              "subscription tracker, bill organizer, budget app, personal finance, recurring payments, expense tracking",
          },
          {
            name: "application-name",
            content: "Matcharge",
          },
        ]}
      />

      <Navbar bg={""} />

      <main className={` text-[#3A4D39] ${inter.className}`}>
        {/* Hero Section */}
        <section className="lg:max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-4 text-center py-20 md:py-32 px-4">
          <div className="flex flex-col items-center md:items-start md:text-left max-w-2xl mx-auto">
            <img
              src="https://ik.imagekit.io/ps3xes4nrg/matcharge/matcharge-app-icon_nHNLAGGcI.png?updatedAt=1761149214060"
              alt="Matcharge Logo"
              className="mx-auto md:mx-2 mb-6 size-20 md:size-24 h-auto"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find your financial calm.
            </h1>
            <p className="text-lg md:text-xl text-[#5A785A] mb-8">
              Matcharge is a beautiful and insightful way to track your
              recurring bills, visualize your spending, and end the stress of
              surprise charges.
            </p>
            <a
              href="https://apps.apple.com/us/app/bill-organizer-matcharge/id6752604627?itscg=30200&itsct=apps_box_badge&mttnsubad=6752604627"
              className="mt-4 inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1761091200"
                alt="Download on the App Store"
                className="w-fit h-15 align-vertical-middle object-contain"
              />
            </a>
          </div>

          <div className="flex justify-center items-center w-full">
            <div className="relative max-w-xl flex justify-center items-center">
              <video
                className="w-[50%]"
                autoPlay
                loop
                preload="true"
                muted
                controls={false}
                playsInline
              >
                <source
                  src="https://ik.imagekit.io/ps3xes4nrg/matcharge/matcharge-app-preview_0DQiDE35b.mp4"
                  type="video/mp4"
                />
              </video>
              <img
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-[55%] z-10"
                src="https://ik.imagekit.io/ps3xes4nrg/matcharge/Blue_G0U0o2esj.png"
                alt="device"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-[#E6EFE7] py-20 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Built for simple subscription clarity
            </h2>
            <p className="text-[#5A785A] text-lg">
              Track recurring bills, catch forgotten trials, and visualize
              spending with calm, focused tools.
            </p>
          </div>

          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-12 xl:gap-8 text-center">
            <div className="overflow-hidden grid grid-cols-2 lg:grid-cols-1">
              <div className="md:h-96 justify-center items-center flex ">
                <img
                  src="/mockups/matcharge-mockup-1.webp"
                  alt="Spending Visualization"
                  width={500}
                  height={800}
                  className="md:w-2/3 h-full object-cover object-top  overflow-hidden"
                  loading="lazy"
                />
              </div>
              <div className="p-5 text-left lg:text-center">
                <h3 className="text-xl font-bold mb-2">
                  Visualize Your Spending
                </h3>
                <p className="text-[#5A785A]">
                  See your subscriptions at a glance in a calming Zen Garden
                  bowl.
                </p>
              </div>
            </div>

            <div className="overflow-hidden grid grid-cols-2 lg:grid-cols-1">
              <div className="md:h-96 justify-center items-center flex ">
                <img
                  src="/mockups/matcharge-mockup-3.webp"
                  alt="Insight Engine"
                  width={500}
                  height={800}
                  className="md:w-2/3 h-full object-cover object-top  overflow-hidden"
                  loading="lazy"
                />
              </div>
              <div className="p-5 text-left lg:text-center">
                <h3 className="text-xl font-bold mb-2">
                  Unlock Your Insight Engine
                </h3>
                <p className="text-[#5A785A]">
                  Understand your habits over time with beautiful historical
                  charts.
                </p>
              </div>
            </div>

            <div className="overflow-hidden grid grid-cols-2 lg:grid-cols-1">
              <div className="md:h-96 justify-center items-center flex">
                <img
                  src="/mockups/matcharge-mockup-2.webp"
                  alt="Trial Detox"
                  width={500}
                  height={800}
                  className="md:w-2/3 h-full object-cover object-top  overflow-hidden"
                  loading="lazy"
                />
              </div>
              <div className="p-5 text-left lg:text-center">
                <h3 className="text-xl font-bold mb-2">
                  Catch Forgotten Trials
                </h3>
                <p className="text-[#5A785A]">
                  Get smart 'Trial Detox' reminders before you're charged.
                </p>
              </div>
            </div>

            <div className="overflow-hidden grid grid-cols-2 lg:grid-cols-1">
              <div className="md:h-96 justify-center items-center flex">
                <img
                  src="/mockups/matcharge-mockup-4.webp"
                  alt="Upcoming Billing Calendar"
                  width={500}
                  height={800}
                  className="md:w-2/3 h-full object-cover object-top  overflow-hidden"
                  loading="lazy"
                />
              </div>
              <div className="p-5 text-left lg:text-center">
                <h3 className="text-xl font-bold mb-2">
                  Upcoming Billing Calendar
                </h3>
                <p className="text-[#5A785A]">
                  See your next subscriptions and due dates in a calendar view.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-[#5A785A] text-lg">
              Answers to common questions about how Matcharge works, privacy,
              pricing, and support.
            </p>
          </div>

          <div className="container mx-auto max-w-4xl space-y-3">
            {faqData.map((item, idx) => (
              <div
                key={idx}
                tabIndex={0}
                className="collapse collapse-arrow border border-base-200 bg-white rounded-2xl"
              >
                <div className="collapse-title text-lg font-medium">
                  {item.question}
                </div>
                <div className="collapse-content">
                  <p className="text-[#5A785A]">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <Footer bg={"bg-[#F0F5F1]"} />
      </main>
    </div>
  );
}
