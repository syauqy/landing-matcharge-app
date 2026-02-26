import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProjectionEquivalents } from "@/utils/leakage-calculator";
import { AnimatedNumber } from "./ResultsPanel";

/**
 * ProjectionSection
 *
 * Shows the 10-year future value of recovered leakage at 8% annual return.
 * Presented as a calm, data-backed insight — not alarmist.
 *
 * @param {{ result: import('@/utils/leakage-calculator').CalculationResult }} props
 */
export default function ProjectionSection({ result }) {
  const [expanded, setExpanded] = useState(false);
  const { futureValue, leakageAvg } = result;
  const equivalents = getProjectionEquivalents(leakageAvg);
  // 20-year future value at 8% (same assumption)
  const futureValue20 = Math.round(
    leakageAvg * ((Math.pow(1.08, 20) - 1) / 0.08),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 md:px-8 py-5 text-left group"
      >
        <div>
          <p className="text-sm font-semibold text-[#111] group-hover:text-primary transition-colors">
            What if you redirected this money?
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            10-year projection at 8% annual return
          </p>
        </div>
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-transform ${
            expanded ? "rotate-45" : ""
          }`}
        >
          <svg
            className="w-3 h-3 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="projection-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-8 border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-500 mb-5">
                Small recurring amounts compound quietly.
              </p>

              <p className="text-xs text-gray-400 mb-5">
                If redirected and invested annually at 8%:
              </p>

              {/* Escalation structure — 20yr is the dominant anchor */}
              <div className="space-y-5 mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                    per year
                  </span>
                  <span className="text-lg text-gray-800 tabular-nums">
                    <AnimatedNumber value={leakageAvg} />
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                    in 10 years
                  </span>
                  <span className="text-lg font-semibold text-gray-800 tabular-nums">
                    <AnimatedNumber value={futureValue} />
                  </span>
                </div>
                <div className="flex items-baseline gap-3 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                    in 20 years
                  </span>
                  <span className="text-3xl font-semibold text-emerald-600 tabular-nums leading-none">
                    <AnimatedNumber value={futureValue20} />
                  </span>
                </div>
              </div>

              {equivalents.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-3">
                    Your annual leakage is also equivalent to:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {equivalents.map((e, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 font-medium"
                      >
                        {e.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-6 text-xs text-gray-400 leading-relaxed">
                Projection assumes the full leakage average is redirected and
                compounded annually. This is illustrative, not financial advice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
