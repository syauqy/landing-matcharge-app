import React, { useState } from "react";
import { motion } from "framer-motion";
import { buildShareUrl } from "@/utils/leakage-calculator";

/**
 * ShareSection
 *
 * Generates a shareable URL that auto-populates the calculator on load.
 *
 * @param {{ inputs: import('@/utils/leakage-calculator').CalculatorInputs }} props
 */
export default function ShareSection({ inputs }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const url = buildShareUrl(inputs);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: do nothing silently
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#111] mb-0.5">Share your estimate</p>
          <p className="text-xs text-gray-400">
            Generate a link that pre-fills these inputs for anyone you share with.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors flex-shrink-0 ${
            copied
              ? "bg-success/10 text-success border-success/30"
              : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
