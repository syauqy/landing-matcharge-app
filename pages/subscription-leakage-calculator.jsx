import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import CalculatorForm from "@/components/calculator/CalculatorForm";
import ResultsReveal from "@/components/calculator/ResultsPanel";
import BehavioralInsights from "@/components/calculator/BehavioralInsights";
import ProjectionSection from "@/components/calculator/ProjectionSection";
import ComparisonSection from "@/components/calculator/ComparisonSection";
import ShareSection from "@/components/calculator/ShareSection";
import EducationSection from "@/components/calculator/EducationSection";
import FAQSection, { FAQ_ITEMS } from "@/components/calculator/FAQSection";
import { calculateLeakage, parseShareParams } from "@/utils/leakage-calculator";

const CANONICAL_URL =
  "https://www.matcharge.app/subscription-leakage-calculator";

const DEFAULT_INPUTS = {
  subscriptionCount: 8,
  averageCost: 15,
  reviewFrequency: "few_months",
  unusedSubscriptions: "not_sure",
};

const WEB_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Subscription Leakage Index & Calculator",
  description:
    "Estimate how much money may be silently leaking from your subscriptions. Free behavioral finance tool by Matcharge.",
  url: CANONICAL_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "Matcharge",
    url: "https://www.matcharge.app",
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function SubscriptionLeakageCalculatorPage() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [result, setResult] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Hydrate from URL params on mount — auto-calculate if params present
  useEffect(() => {
    const params = Object.fromEntries(
      new URLSearchParams(window.location.search).entries(),
    );
    if (params.subs || params.cost || params.review || params.unused) {
      const parsed = parseShareParams(params);
      if (parsed) {
        setInputs(parsed);
        setResult(calculateLeakage(parsed));
        setHasCalculated(true);
        setTimeout(() => {
          const el = document.getElementById("results-section");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
      }
    }
  }, []);

  const handleChange = (updates) => {
    setInputs((prev) => ({ ...prev, ...updates }));
    setHasCalculated(false);
    setResult(null);
  };

  const handleCalculate = () => {
    const calculated = calculateLeakage(inputs);
    setResult(calculated);
    setHasCalculated(true);
    setTimeout(() => {
      const el = document.getElementById("results-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <NextSeo
        title="Subscription Leakage Index & Calculator | Matcharge"
        description="Estimate how much money may be silently leaking from your subscriptions. Free behavioral finance tool by Matcharge."
        canonical={CANONICAL_URL}
        openGraph={{
          type: "website",
          url: CANONICAL_URL,
          title: "Subscription Leakage Index & Calculator | Matcharge",
          description:
            "Estimate how much money may be silently leaking from your subscriptions. Free behavioral finance tool by Matcharge.",
          images: [
            {
              url: "https://www.matcharge.app/matcharge-og-image.png",
              width: 1200,
              height: 630,
              alt: "Subscription Leakage Index by Matcharge",
            },
          ],
        }}
      />

      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(WEB_APPLICATION_SCHEMA),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
        />
      </Head>

      <Navbar bg="bg-white" page="calculator" />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="border-b border-gray-100 pt-16 pb-14 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
                Subscription Leakage Index™ by Matcharge
              </p>
              <h1 className="text-[2.25rem] md:text-[3rem] font-bold text-[#111] leading-tight tracking-tight mb-5 max-w-2xl">
                Your subscriptions may be costing more than you think.
              </h1>
              <p className="text-[1.0625rem] text-gray-500 leading-[1.75] max-w-xl mb-3">
                This free tool estimates how much money may be leaking from your
                recurring payments — without you noticing.
              </p>
              <p className="text-xs text-gray-400">
                Anonymous. No login. Runs entirely in your browser.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Calculator + Results ─────────────────────────────────────── */}
        <section className="bg-[#f7f7f7] py-14">
          <div className="max-w-4xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
              >
                <CalculatorForm
                  inputs={inputs}
                  onChange={handleChange}
                  onCalculate={handleCalculate}
                />
              </motion.div>

              {hasCalculated && result && (
                <div id="results-section">
                  <ResultsReveal result={result} />
                  <BehavioralInsights inputs={inputs} />
                  <ComparisonSection leakageAvg={result.leakageAvg} />
                  <ProjectionSection result={result} />
                  <blockquote className="mt-8 mb-8 px-6 py-5 border-l-2 border-gray-200">
                    <p className="text-base italic text-gray-600 leading-relaxed">
                      Most subscription waste isn&apos;t visible — until you
                      measure it.
                    </p>
                  </blockquote>
                  <ShareSection inputs={inputs} result={result} />
                  <AuthorityCTA result={result} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Education ────────────────────────────────────────────────── */}
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <EducationSection />
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="bg-[#f7f7f7] py-16 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <FAQSection />
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────────── */}
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <AuthorityCTA />
            </div>
          </div>
        </section>
      </main>

      <Footer bg="bg-[#f7f7f7]" />
    </div>
  );
}

function AuthorityCTA({ result = null }) {
  const headline = result
    ? `$${result.leakageHigh} per year doesn't need to stay invisible.`
    : "This leakage isn't permanent.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-10"
    >
      <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
        Matcharge
      </p>
      <h3 className="text-xl font-bold text-[#111] mb-3 leading-snug max-w-md">
        {headline}
      </h3>
      <p className="text-sm text-gray-500 leading-[1.75] mb-5 max-w-md">
        Most subscription waste isn&apos;t caused by reckless spending. It
        accumulates through inattention. Visibility is the structural fix —
        knowing what you pay, when it renews, and whether it still belongs.
      </p>
      <ul className="space-y-2.5 mb-8">
        {[
          "Track every recurring payment",
          "See upcoming charges before they hit",
          "Calendar view of all renewals",
          "Get reminders before billing dates",
        ].map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm text-gray-600"
          >
            <svg
              className="w-4 h-4 text-primary mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {item}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        <a
          href="https://apps.apple.com/us/app/bill-organizer-matcharge/id6752604627?itscg=30200&itsct=apps_box_badge&mttnsubad=6752604627"
          className="mt-2 inline-block"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1761091200"
            alt="Download on the App Store"
            className="w-fit h-15 align-vertical-middle object-contain"
          />
          <span className="text-sm font-normal opacity-80">
            Free. No account required to start.
          </span>
        </a>
        <Link
          href="/blog/subscription-tracking-guide"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-primary rounded-xl font-semibold text-sm  hover:border-primary hover:text-primary transition-colors"
        >
          Learn how subscription leakage happens
        </Link>
      </div>
    </motion.div>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
