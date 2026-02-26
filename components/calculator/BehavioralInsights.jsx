import React from "react";
import { motion } from "framer-motion";
import { getBehavioralInsights } from "@/utils/leakage-calculator";

/**
 * BehavioralInsights
 *
 * Context-aware copy that makes the tool feel intelligent.
 * Generated dynamically from user inputs.
 *
 * @param {{ inputs: import('@/utils/leakage-calculator').CalculatorInputs }} props
 */
export default function BehavioralInsights({ inputs }) {
  const insights = getBehavioralInsights(inputs);

  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
      className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8"
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Behavioral context
      </p>
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <p key={i} className="text-sm text-gray-600 leading-[1.8]">
            {insight}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
