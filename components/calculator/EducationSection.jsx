import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const CARDS = [
  {
    title: "Below $15, the brain doesn't act.",
    body: "Services priced under $15/month sit in a psychological blind spot — too small to justify the friction of canceling, large enough to accumulate at scale. The pricing isn't coincidental. It's structural.",
  },
  {
    title: "You forget the trial before it ends.",
    body: "Trial periods are structured so the first charge arrives after engagement has already peaked. By the billing date, the context for canceling has gone — and the subscription quietly converts.",
  },
  {
    title: "Renewal notices are sent to be missed.",
    body: "Billing emails arrive close to the charge date, leaving a narrow window. Short enough to pass unnoticed. Long enough for the service to say it was disclosed. The design favors continuation.",
  },
];

/**
 * EducationSection
 *
 * Three concise insight cards explaining the mechanics of subscription leakage.
 * Positioned after results to deepen engagement and reinforce the tool's authority.
 */
export default function EducationSection() {
  return (
    <section className="mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-bold text-[#111] mb-2">
          Why subscription leakage happens
        </h2>
        <p className="text-sm text-gray-400 mb-8 max-w-lg">
          Three structural reasons recurring charges accumulate without
          awareness.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#111] mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 leading-[1.75]">
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="text-sm text-gray-500">
          <Link
            href="/blog/subscription-tracking-guide"
            className="text-primary underline hover:text-primary/80 font-medium"
          >
            Read our complete guide to subscription tracking →
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
