import React from "react";
import { motion } from "framer-motion";
import { SOCIAL_BASELINE } from "@/utils/leakage-calculator";

/**
 * ComparisonSection
 *
 * Social comparison layer. Creates ego-aware engagement.
 * Structured for future replacement with real aggregated data.
 *
 * @param {{ leakageAvg: number }} props
 */
export default function ComparisonSection({ leakageAvg }) {
  const isAboveAverage = leakageAvg > SOCIAL_BASELINE.value;
  const diff = Math.abs(leakageAvg - SOCIAL_BASELINE.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
      className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8"
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        How you compare
      </p>

      {/* Visual bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>$0</span>
          <span>Average: ${SOCIAL_BASELINE.value}</span>
          <span>${Math.max(leakageAvg, SOCIAL_BASELINE.value) + 50}</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          {/* Baseline marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-300 z-10"
            style={{
              left: `${(SOCIAL_BASELINE.value / (Math.max(leakageAvg, SOCIAL_BASELINE.value) + 50)) * 100}%`,
            }}
          />
          {/* User bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, (leakageAvg / (Math.max(leakageAvg, SOCIAL_BASELINE.value) + 50)) * 100)}%`,
            }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-full rounded-full ${
              isAboveAverage ? "bg-error/60" : "bg-success/60"
            }`}
          />
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-[1.75]">
        {isAboveAverage ? (
          <>
            Your estimate of{" "}
            <span className="font-semibold text-[#111]">
              ${leakageAvg}/year
            </span>{" "}
            is <span className="font-semibold text-[#111]">${diff} above</span>{" "}
            the baseline average of ${SOCIAL_BASELINE.value}. This suggests a
            higher than typical exposure to unmanaged recurring charges.
          </>
        ) : (
          <>
            Your estimate of{" "}
            <span className="font-semibold text-[#111]">
              ${leakageAvg}/year
            </span>{" "}
            is <span className="font-semibold text-[#111]">${diff} below</span>{" "}
            the baseline average of ${SOCIAL_BASELINE.value}. You appear more
            optimized than most users in managing recurring payments.
          </>
        )}
      </p>

      <p className="mt-3 text-xs text-gray-400">
        Based on {SOCIAL_BASELINE.source}.
      </p>
    </motion.div>
  );
}
