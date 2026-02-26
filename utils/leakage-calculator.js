/**
 * Subscription Leakage Calculator — core logic
 *
 * All calculation is client-side. No API calls, no server logic.
 * Designed for future extensibility: country-specific rates, event tracking.
 */

/** @typedef {'monthly' | 'few_months' | 'yearly' | 'never'} ReviewFrequency */
/** @typedef {'yes' | 'not_sure' | 'no'} UnusedAnswer */

/**
 * @typedef {Object} CalculatorInputs
 * @property {number} subscriptionCount - Number of subscriptions (1–20)
 * @property {number} averageCost - Average monthly cost per subscription (USD)
 * @property {ReviewFrequency} reviewFrequency - How often user reviews subscriptions
 * @property {UnusedAnswer} unusedSubscriptions - Whether user pays for unused subs
 */

/**
 * @typedef {Object} CalculationResult
 * @property {number} annualSpend - Total projected annual spend
 * @property {number} leakageLow - Low-end leakage estimate (annual)
 * @property {number} leakageHigh - High-end leakage estimate (annual)
 * @property {number} monthlyLeakageAverage - Average monthly leakage
 */

/** Base leakage rates by review frequency */
const LEAKAGE_RATES = {
  monthly: 0.03,
  few_months: 0.08,
  yearly: 0.12,
  never: 0.17,
};

/** Adjustments for unused subscription answer */
const UNUSED_ADJUSTMENT = {
  yes: 0.03,
  not_sure: 0.015,
  no: 0,
};

/**
 * Calculate leakage estimates based on user inputs.
 *
 * @param {CalculatorInputs} inputs
 * @returns {CalculationResult}
 */
export function calculateLeakage({ subscriptionCount, averageCost, reviewFrequency, unusedSubscriptions }) {
  const totalMonthly = subscriptionCount * averageCost;
  const annualSpend = totalMonthly * 12;

  const baseRate = LEAKAGE_RATES[reviewFrequency] ?? LEAKAGE_RATES.few_months;
  const adjustment = UNUSED_ADJUSTMENT[unusedSubscriptions] ?? 0;
  const leakageRate = baseRate + adjustment;

  const leakageLow = Math.max(0, annualSpend * (leakageRate - 0.02));
  const leakageHigh = Math.max(0, annualSpend * (leakageRate + 0.02));
  const monthlyLeakageAverage = ((leakageLow + leakageHigh) / 2) / 12;

  return {
    annualSpend: Math.round(annualSpend),
    leakageLow: Math.round(leakageLow),
    leakageHigh: Math.round(leakageHigh),
    monthlyLeakageAverage: Math.round(monthlyLeakageAverage),
  };
}

/**
 * Generate a shareable URL query string from inputs.
 *
 * @param {CalculatorInputs} inputs
 * @returns {string} - Query string e.g. "?subs=8&cost=15&review=never&unused=yes"
 */
export function buildShareUrl(inputs) {
  const params = new URLSearchParams({
    subs: String(inputs.subscriptionCount),
    cost: String(inputs.averageCost),
    review: inputs.reviewFrequency,
    unused: inputs.unusedSubscriptions,
  });
  return `${typeof window !== "undefined" ? window.location.origin : "https://matcharge.app"}/subscription-leakage-calculator?${params.toString()}`;
}

/**
 * Parse URL query params into calculator inputs.
 * Returns null if params are missing or invalid.
 *
 * @param {URLSearchParams | Record<string, string>} params
 * @returns {CalculatorInputs | null}
 */
export function parseShareParams(params) {
  const subs = parseInt(params.subs ?? params.get?.("subs") ?? "", 10);
  const cost = parseFloat(params.cost ?? params.get?.("cost") ?? "");
  const review = params.review ?? params.get?.("review");
  const unused = params.unused ?? params.get?.("unused");

  const validReviews = Object.keys(LEAKAGE_RATES);
  const validUnused = Object.keys(UNUSED_ADJUSTMENT);

  if (
    isNaN(subs) || subs < 1 || subs > 20 ||
    isNaN(cost) || cost <= 0 ||
    !validReviews.includes(review) ||
    !validUnused.includes(unused)
  ) {
    return null;
  }

  return { subscriptionCount: subs, averageCost: cost, reviewFrequency: review, unusedSubscriptions: unused };
}

/** Human-readable labels for review frequency options */
export const REVIEW_FREQUENCY_LABELS = {
  monthly: "Monthly",
  few_months: "Every few months",
  yearly: "Once a year",
  never: "Never",
};

/** Human-readable labels for unused subscription options */
export const UNUSED_LABELS = {
  yes: "Yes",
  not_sure: "Not sure",
  no: "No",
};

/** Average monthly cost preset options */
export const COST_PRESETS = [5, 10, 15, 25];

/**
 * Equivalent comparisons for the results panel.
 * Accepts leakageHigh to select the most relevant comparisons.
 */
export function getEquivalentComparisons(annualLeakageAvg) {
  return [
    {
      label: "a weekend trip",
      threshold: 200,
      applies: annualLeakageAvg >= 100,
    },
    {
      label: "3 months of groceries",
      threshold: 600,
      applies: annualLeakageAvg >= 300,
    },
    {
      label: "a year of gym membership",
      threshold: 360,
      applies: annualLeakageAvg >= 200,
    },
  ].filter((c) => c.applies);
}
