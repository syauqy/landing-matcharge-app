import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import CalculatorForm from "@/components/calculator/CalculatorForm";
import ResultsPanel from "@/components/calculator/ResultsPanel";
import ShareSection from "@/components/calculator/ShareSection";
import FAQSection, { FAQ_ITEMS } from "@/components/calculator/FAQSection";
import {
  calculateLeakage,
  parseShareParams,
} from "@/utils/leakage-calculator";

const CANONICAL_URL = "https://matcharge.app/subscription-leakage-calculator";

const DEFAULT_INPUTS = {
  subscriptionCount: 8,
  averageCost: 15,
  reviewFrequency: "few_months",
  unusedSubscriptions: "not_sure",
};

const WEB_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Subscription Leakage Calculator",
  description:
    "Estimate how much money you may be losing to unmanaged subscriptions. Free anonymous subscription cost calculator by Matcharge.",
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
    url: "https://matcharge.app",
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: a,
    },
  })),
};

export default function SubscriptionLeakageCalculatorPage() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [result, setResult] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Hydrate from URL params on mount
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
      }
    }
  }, []);

  const handleChange = (updates) => {
    setInputs((prev) => ({ ...prev, ...updates }));
    // Reset results on input change so user needs to recalculate
    setHasCalculated(false);
    setResult(null);
  };

  const handleCalculate = () => {
    const calculated = calculateLeakage(inputs);
    setResult(calculated);
    setHasCalculated(true);

    // Smooth scroll to results on mobile
    setTimeout(() => {
      const el = document.getElementById("results-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <NextSeo
        title="Subscription Leakage Calculator | Matcharge"
        description="Estimate how much money you may be losing to unmanaged subscriptions. Free anonymous subscription cost calculator by Matcharge."
        canonical={CANONICAL_URL}
        openGraph={{
          type: "website",
          url: CANONICAL_URL,
          title: "Subscription Leakage Calculator | Matcharge",
          description:
            "Estimate how much money you may be losing to unmanaged subscriptions. Free anonymous subscription cost calculator by Matcharge.",
          images: [
            {
              url: "https://matcharge.app/matcharge-og-image.png",
              width: 1200,
              height: 630,
              alt: "Subscription Leakage Calculator by Matcharge",
            },
          ],
        }}
      />

      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEB_APPLICATION_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
        />
      </Head>

      <Navbar bg="bg-white" page="calculator" />

      <main>
        {/* Hero */}
        <section className="border-b border-gray-100 pt-16 pb-14 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
                Free tool
              </p>
              <h1 className="text-[2.25rem] md:text-[3rem] font-bold text-[#111] leading-tight tracking-tight mb-5">
                Subscription Leakage Calculator
              </h1>
              <p className="text-[1.0625rem] text-gray-500 leading-[1.75] max-w-xl">
                Estimate the hidden cost of unmanaged recurring payments. No
                login required — fully private, runs in your browser.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Calculator + Results */}
        <section className="bg-[#fafafa] py-14">
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

              {/* Results (conditionally rendered) */}
              {hasCalculated && result && (
                <div id="results-section">
                  <ResultsPanel result={result} />
                  <ShareSection inputs={inputs} />
                  <CTASection />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Educational explanation */}
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <h2 className="text-2xl font-bold text-[#111] mb-4">
                  What is subscription leakage?
                </h2>
                <div className="space-y-4 text-[1.0125rem] text-gray-500 leading-[1.75]">
                  <p>
                    Subscription leakage refers to recurring charges that continue
                    after you no longer need — or remember — the service. Free
                    trials that auto-renew, price increases on long-standing plans,
                    and duplicate services across household members are the most
                    common sources.
                  </p>
                  <p>
                    Unlike one-time purchases, subscriptions are designed to blend
                    into your spending. Their size makes them easy to overlook on
                    bank statements, but their recurring nature means even small
                    amounts compound significantly over a year.
                  </p>
                  <p>
                    Consistent tracking is the most effective countermeasure. People
                    who review their subscriptions monthly typically leak 3–5% of
                    their annual subscription spend. Those who review yearly or
                    never can leak 15–20% or more.
                  </p>
                  <p>
                    <Link
                      href="/blog/subscription-tracking-guide"
                      className="text-primary underline hover:text-primary/80 font-medium"
                    >
                      Read our complete guide to subscription tracking →
                    </Link>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#fafafa] py-16 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <FAQSection />
          </div>
        </section>

        {/* Bottom CTA (always visible) */}
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <CTASection />
            </div>
          </div>
        </section>
      </main>

      <Footer bg="bg-[#fafafa]" />
    </div>
  );
}

function CTASection() {
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
      <h3 className="text-xl font-bold text-[#111] mb-3 leading-snug">
        Tracking recurring payments consistently eliminates most subscription leakage.
      </h3>
      <ul className="space-y-2 mb-8">
        {[
          "Track every recurring payment",
          "See upcoming charges before they hit",
          "Calendar view of all renewals",
          "Get reminders before billing dates",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://apps.apple.com/app/matcharge/id6741440985"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Download on the App Store
        </a>
        <Link
          href="/blog/subscription-tracking-guide"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors"
        >
          Learn how subscription leakage happens
        </Link>
      </div>
    </motion.div>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
