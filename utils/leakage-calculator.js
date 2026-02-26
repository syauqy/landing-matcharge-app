/**
 * Subscription Leakage Index™ — core calculation logic
 *
 * All logic is client-side. No API calls, no server-side processing.
 * Structured for future extensibility: real aggregated stats, event tracking, country localization.
 */

/** @typedef {'monthly' | 'few_months' | 'yearly' | 'never'} ReviewFrequency */
/** @typedef {'yes' | 'not_sure' | 'no'} UnusedAnswer */

/**
 * @typedef {Object} CalculatorInputs
 * @property {number} subscriptionCount
 * @property {number} averageCost
 * @property {ReviewFrequency} reviewFrequency
 * @property {UnusedAnswer} unusedSubscriptions
 */

/**
 * @typedef {Object} CalculationResult
 * @property {number} annualSpend
 * @property {number} leakageLow
 * @property {number} leakageHigh
 * @property {number} leakageAvg
 * @property {number} monthlyLeakageAverage
 * @property {number} leakageRate
 * @property {number} efficiencyScore
 * @property {string} efficiencyClass
 * @property {string} efficiencyColor
 * @property {number} futureValue
 */

const LEAKAGE_RATES = {
  monthly: 0.03,
  few_months: 0.08,
  yearly: 0.12,
  never: 0.17,
};

const UNUSED_ADJUSTMENT = {
  yes: 0.03,
  not_sure: 0.015,
  no: 0,
};

const EFFICIENCY_CLASSES = [
  { min: 85, max: 100, label: "Highly Optimized", color: "text-success" },
  { min: 65, max: 84, label: "Slight Leakage", color: "text-warning" },
  { min: 40, max: 64, label: "Moderate Leakage", color: "text-orange-500" },
  { min: 0, max: 39, label: "High Leakage", color: "text-error" },
];

/**
 * Static baseline for social comparison.
 * Replace `value` with live aggregate when real data is available.
 */
export const SOCIAL_BASELINE = {
  value: 276,
  source: "baseline estimate",
};

/**
 * Calculate all leakage metrics from user inputs.
 *
 * @param {CalculatorInputs} inputs
 * @returns {CalculationResult}
 */
export function calculateLeakage({
  subscriptionCount,
  averageCost,
  reviewFrequency,
  unusedSubscriptions,
}) {
  const totalMonthly = subscriptionCount * averageCost;
  const annualSpend = totalMonthly * 12;

  const baseRate = LEAKAGE_RATES[reviewFrequency] ?? LEAKAGE_RATES.few_months;
  const adjustment = UNUSED_ADJUSTMENT[unusedSubscriptions] ?? 0;
  const leakageRate = baseRate + adjustment;

  const leakageLow = Math.max(0, annualSpend * (leakageRate - 0.02));
  const leakageHigh = Math.max(0, annualSpend * (leakageRate + 0.02));
  const leakageAvg = (leakageLow + leakageHigh) / 2;
  const monthlyLeakageAverage = leakageAvg / 12;

  const efficiencyScore = Math.round(
    Math.min(100, Math.max(0, 100 - leakageRate * 100)),
  );

  const classification =
    EFFICIENCY_CLASSES.find(
      (c) => efficiencyScore >= c.min && efficiencyScore <= c.max,
    ) ?? EFFICIENCY_CLASSES[EFFICIENCY_CLASSES.length - 1];

  const annualLeakageRounded = Math.round(leakageAvg);
  const futureValue = Math.round(
    annualLeakageRounded * ((Math.pow(1.08, 10) - 1) / 0.08),
  );

  return {
    annualSpend: Math.round(annualSpend),
    leakageLow: Math.round(leakageLow),
    leakageHigh: Math.round(leakageHigh),
    leakageAvg: annualLeakageRounded,
    monthlyLeakageAverage: Math.round(monthlyLeakageAverage),
    leakageRate,
    efficiencyScore,
    efficiencyClass: classification.label,
    efficiencyColor: classification.color,
    futureValue,
  };
}

/**
 * Generate context-aware behavioral insight copy based on inputs.
 *
 * @param {CalculatorInputs} inputs
 * @returns {string[]}
 */
export function getBehavioralInsights({
  reviewFrequency,
  unusedSubscriptions,
}) {
  const insights = [];

  const reviewInsights = {
    monthly:
      "Monthly review is the most effective habit for minimizing subscription waste. You're likely catching errant charges before they compound.",
    few_months:
      "Reviewing every few months leaves a window for charges to accumulate unnoticed. Even one missed cycle can mean multiple billing periods of silent spend.",
    yearly:
      "Annual review means charges can accumulate for up to 11 months before being caught. This is one of the strongest behavioural predictors of elevated subscription leakage.",
    never:
      "Infrequent subscription review is the single strongest predictor of recurring payment leakage. Without regular audits, trial conversions and price increases go undetected indefinitely.",
  };

  const unusedInsights = {
    yes: "Knowingly paying for services you don't use significantly accelerates cost accumulation. Cancellation friction is a well-documented effect — charges persist because the action of cancelling feels effortful.",
    not_sure:
      "Uncertainty about active subscriptions suggests at least some charges may be going unexamined. Services subscribed during high-intent periods are particularly prone to quiet persistence.",
    no: null,
  };

  if (reviewInsights[reviewFrequency])
    insights.push(reviewInsights[reviewFrequency]);
  if (unusedInsights[unusedSubscriptions])
    insights.push(unusedInsights[unusedSubscriptions]);

  return insights;
}

/**
 * Build a shareable URL encoding calculator inputs as query params.
 *
 * @param {CalculatorInputs} inputs
 * @returns {string}
 */
export function buildShareUrl(inputs) {
  const params = new URLSearchParams({
    subs: String(inputs.subscriptionCount),
    cost: String(inputs.averageCost),
    review: inputs.reviewFrequency,
    unused: inputs.unusedSubscriptions,
  });
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://matcharge.app";
  return `${origin}/subscription-leakage-calculator?${params.toString()}`;
}

/**
 * Build the pre-composed share message for social sharing.
 *
 * @param {CalculationResult} result
 * @returns {string}
 */
export function buildShareMessage(result) {
  return `My Subscription Efficiency Score is ${result.efficiencyScore}/100. I ran the Subscription Leakage Index by Matcharge and finally understood where my recurring spend was going.`;
}

/**
 * Parse URL query params back into calculator inputs.
 * Returns null if params are missing or invalid.
 *
 * @param {Record<string, string>} params
 * @returns {CalculatorInputs | null}
 */
export function parseShareParams(params) {
  const get = (key) => params[key] ?? params.get?.(key);

  const subs = parseInt(get("subs") ?? "", 10);
  const cost = parseFloat(get("cost") ?? "");
  const review = get("review");
  const unused = get("unused");

  const validReviews = Object.keys(LEAKAGE_RATES);
  const validUnused = Object.keys(UNUSED_ADJUSTMENT);

  if (
    isNaN(subs) ||
    subs < 1 ||
    subs > 20 ||
    isNaN(cost) ||
    cost <= 0 ||
    !validReviews.includes(review) ||
    !validUnused.includes(unused)
  ) {
    return null;
  }

  return {
    subscriptionCount: subs,
    averageCost: cost,
    reviewFrequency: review,
    unusedSubscriptions: unused,
  };
}

export const REVIEW_FREQUENCY_LABELS = {
  monthly: "Monthly",
  few_months: "Every few months",
  yearly: "Once a year",
  never: "Never",
};

export const UNUSED_LABELS = {
  yes: "Yes",
  not_sure: "Not sure",
  no: "No",
};

export const COST_PRESETS = [5, 10, 15, 25];

/**
 * Return calm, conservative equivalents for a given annual leakage average.
 *
 * @param {number} annualLeakageAvg
 * @returns {{ label: string }[]}
 */
export function getProjectionEquivalents(annualLeakageAvg) {
  return [
    { threshold: 100, label: "a weekend city trip" },
    { threshold: 200, label: "a year of gym membership" },
    { threshold: 400, label: "3 months of groceries" },
    { threshold: 600, label: "a return flight" },
  ].filter((i) => annualLeakageAvg >= i.threshold);
}
