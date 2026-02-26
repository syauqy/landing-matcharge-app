import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { getEquivalentComparisons } from "@/utils/leakage-calculator";
import Link from "next/link";

/**
 * Animated number counter.
 */
function AnimatedNumber({ value, prefix = "$" }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 18 });
  const displayed = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}`);
  const spanRef = useRef(null);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(
    () =>
      displayed.on("change", (v) => {
        if (spanRef.current) spanRef.current.textContent = v;
      }),
    [displayed],
  );

  return <span ref={spanRef}>{prefix}0</span>;
}

/**
 * ResultsPanel
 *
 * Shows the calculated leakage estimate, equivalent comparisons,
 * and a soft educational note.
 *
 * @param {{ result: import('@/utils/leakage-calculator').CalculationResult }} props
 */
export default function ResultsPanel({ result }) {
  const { annualSpend, leakageLow, leakageHigh, monthlyLeakageAverage } = result;
  const avgLeakage = Math.round((leakageLow + leakageHigh) / 2);
  const comparisons = getEquivalentComparisons(avgLeakage);

  const leakagePct = annualSpend > 0
    ? Math.round(((leakageLow + leakageHigh) / 2 / annualSpend) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-10"
    >
      {/* Top label */}
      <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
        Your estimate
      </p>

      {/* Main figure */}
      <h2 className="text-[2rem] md:text-[2.4rem] font-bold text-[#111] leading-tight mb-1">
        <AnimatedNumber value={leakageLow} /> –{" "}
        <AnimatedNumber value={leakageHigh} />
      </h2>
      <p className="text-gray-400 text-sm mb-6">estimated annual subscription leakage</p>

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Monthly leakage</p>
          <p className="text-xl font-bold text-[#111]">
            <AnimatedNumber value={monthlyLeakageAverage} />
          </p>
          <p className="text-xs text-gray-400">per month on average</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Annual spend</p>
          <p className="text-xl font-bold text-[#111]">
            <AnimatedNumber value={annualSpend} />
          </p>
          <p className="text-xs text-gray-400">total recurring per year</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Leakage rate</p>
          <p className="text-xl font-bold text-[#111]">{leakagePct}%</p>
          <p className="text-xs text-gray-400">of your annual spend</p>
        </div>
      </div>

      {/* Equivalent comparisons */}
      {comparisons.length > 0 && (
        <div className="border-t border-gray-100 pt-6 mb-2">
          <p className="text-sm text-gray-500 mb-3">
            That leakage is roughly equivalent to:
          </p>
          <ul className="flex flex-wrap gap-2">
            {comparisons.map((c, i) => (
              <li
                key={i}
                className="text-sm px-3.5 py-1.5 bg-primary/8 text-primary font-medium rounded-full border border-primary/15"
              >
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Educational note */}
      <p className="mt-6 text-xs text-gray-400 leading-relaxed">
        This is a statistical estimate based on typical subscription patterns. Actual leakage depends on your specific services.{" "}
        <Link href="/blog/subscription-tracking-guide" className="underline hover:text-gray-600">
          Learn how subscription leakage happens
        </Link>
        .
      </p>
    </motion.div>
  );
}
