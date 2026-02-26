import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Animated number counter — spring physics for smooth count-up.
 */
export function AnimatedNumber({ value, prefix = "$", className = "" }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const displayed = useTransform(
    spring,
    (v) => `${prefix}${Math.round(v).toLocaleString()}`,
  );
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

  return (
    <span ref={spanRef} className={className}>
      {prefix}0
    </span>
  );
}

/**
 * Animated integer counter with no prefix — used for score.
 */
export function AnimatedInteger({ value, suffix = "", className = "" }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 50, damping: 18 });
  const displayed = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);
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

  return (
    <span ref={spanRef} className={className}>
      0{suffix}
    </span>
  );
}

function getScoreInterpretation(score) {
  if (score >= 85)
    return "More organized than most — but even well-managed subscriptions carry blind spots. Small amounts that renew without active review still compound over years.";
  if (score >= 65)
    return "Awareness is partial. A few subscriptions likely persist past their useful life, quietly adding to annual spend.";
  if (score >= 40)
    return "Several subscriptions may be renewing without active review. Structured tracking typically reduces this category by 20–40%.";
  return "Most users in this range find at least one subscription they'd forgotten about entirely. Consistent tracking changes the pattern.";
}

const LEAKAGE_BASELINE = 276; // structured for future dynamic data replacement

function getComparisonLine(leakageAvg) {
  const diff = leakageAvg - LEAKAGE_BASELINE;
  if (Math.abs(diff) <= 20)
    return "Your estimate is close to the modeled average.";
  if (diff > 0) return "Your estimate is above the modeled average.";
  return "Your estimate is below the modeled average.";
}

function getPercentile(score) {
  if (score >= 90) return 75;
  if (score >= 80) return 62;
  if (score >= 70) return 48;
  if (score >= 60) return 35;
  return 20;
}

/**
 * ResultsReveal
 *
 * The emotional anchor of the tool.
 * Large leakage number → efficiency score → classification badge.
 *
 * @param {{ result: import('@/utils/leakage-calculator').CalculationResult }} props
 */
export default function ResultsReveal({ result }) {
  const {
    leakageLow,
    leakageHigh,
    leakageAvg,
    monthlyLeakageAverage,
    annualSpend,
    efficiencyScore,
    efficiencyClass,
    leakageRate,
  } = result;

  const leakagePct =
    annualSpend > 0 ? Math.round((leakageAvg / annualSpend) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Result band */}
      <div className="bg-[#f7f7f7] border-b border-gray-100 px-6 md:px-10 py-10">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Subscription Leakage Index™ by Matcharge
        </p>
        <p className="text-xs text-gray-400 mt-1 mb-5">
          Modeled using recurring payment behavior patterns. A zero-login
          behavioral finance index.
        </p>

        {/* BIG emotional anchor */}
        <div className="mb-3">
          <div className="text-[3.5rem] md:text-[5rem] font-bold text-[#111] leading-none tabular-nums">
            <AnimatedNumber value={leakageAvg} />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            estimated annual leakage &nbsp;&middot;&nbsp;
            <span className="tabular-nums">
              <AnimatedNumber value={leakageLow} />
            </span>
            &nbsp;&ndash;&nbsp;
            <span className="tabular-nums">
              <AnimatedNumber value={leakageHigh} />
            </span>{" "}
            range
          </p>
          <p className="text-base font-medium text-gray-800 mt-3 leading-snug">
            Subscription leakage is rarely reckless — it&apos;s structural.
          </p>

          {/* Social comparison */}
          <div className="mt-4 space-y-0.5">
            <p className="text-sm text-gray-500">
              Estimated average annual leakage:{" "}
              <span className="font-medium text-gray-900">
                ${LEAKAGE_BASELINE}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Your estimate:{" "}
              <span className="font-medium text-gray-900">${leakageAvg}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {getComparisonLine(leakageAvg)}
            </p>
          </div>
        </div>
      </div>

      {/* Score badge — full width, identity anchor */}
      <div className="px-6 md:px-10 pt-8 pb-0">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-5">
            Subscription Efficiency Score™
          </p>

          {/* Two-column: number+class left, percentile right */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-[5rem] font-extrabold text-[#111] tabular-nums leading-none">
                  <AnimatedInteger value={efficiencyScore} />
                </span>
                <span className="text-2xl text-gray-300 font-light">/100</span>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="text-base font-semibold text-emerald-600 mt-2"
              >
                {efficiencyClass}
              </motion.p>
            </div>

            {/* Percentile — prominent right anchor */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="sm:text-right"
            >
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Percentile ranking
              </p>
              <p className="text-[2.75rem] font-extrabold text-[#111] leading-none tabular-nums">
                {getPercentile(efficiencyScore)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                more optimized than most users
              </p>
            </motion.div>
          </div>

          {/* Interpretation — below the two-col row */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="mt-5 pt-5 border-t border-gray-200 text-sm text-gray-500 leading-relaxed"
          >
            {getScoreInterpretation(efficiencyScore)}
          </motion.p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="px-6 md:px-10 pt-5 pb-8">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">Monthly leakage</p>
            <p className="text-xl font-semibold text-[#111] tabular-nums">
              <AnimatedNumber value={monthlyLeakageAverage} />
            </p>
            <p className="text-xs text-gray-400 mt-0.5">per month on average</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Leakage rate</p>
            <p className="text-xl font-semibold text-[#111] tabular-nums">
              {Math.round(leakageRate * 100)}%
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {leakagePct}% of annual spend
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
