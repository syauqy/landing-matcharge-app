import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "How is leakage estimated?",
    a: "The estimate is based on your review frequency and whether you're aware of unused subscriptions. Infrequent review increases the statistical likelihood that charges accumulate unnoticed. We apply a conservative leakage rate to your total annual spend to produce a plausible range.",
  },
  {
    q: "Is this tool accurate?",
    a: "This is a statistical estimate, not an audit of your accounts. It reflects patterns observed in subscription spending habits. Your actual leakage may be higher or lower. To get an accurate picture, connect your accounts to a dedicated app like Matcharge.",
  },
  {
    q: "Why do subscriptions go unnoticed?",
    a: "Most subscription charges are small and recurring, making them easy to overlook on bank statements. Free trials that auto-convert, price increases on existing plans, and services used only occasionally are the most common sources of unintended spend.",
  },
  {
    q: "How can I reduce subscription waste?",
    a: "The most effective method is a regular subscription audit — once a month is ideal. Review your bank and card statements for recurring charges, cancel anything you haven't used in 30 days, and use a dedicated tracker like Matcharge to see upcoming renewals before they hit.",
  },
  {
    q: "Is this tool anonymous?",
    a: "Yes. This tool runs entirely in your browser. No data is sent to any server, and no account or email is required. The shareable link encodes your inputs as URL parameters only.",
  },
];

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center py-5 text-left gap-4 group"
      >
        <span className="text-sm font-semibold text-[#111] group-hover:text-primary transition-colors">
          {q}
        </span>
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center transition-transform ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-gray-500 leading-[1.75] pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * FAQSection
 *
 * Renders expandable FAQ items. Used for both UX and SEO (FAQPage schema injected at page level).
 */
export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="mt-20 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#111] mb-2">Frequently asked questions</h2>
      <p className="text-sm text-gray-400 mb-8">
        About how this calculator works and subscription leakage in general.
      </p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 md:px-8">
        {FAQ_ITEMS.map((item, i) => (
          <FAQItem
            key={i}
            q={item.q}
            a={item.a}
            isOpen={openIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </section>
  );
}

/** Export FAQ data for JSON-LD schema injection at page level */
export { FAQ_ITEMS };
