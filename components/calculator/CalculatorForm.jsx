import React from "react";
import {
  COST_PRESETS,
  REVIEW_FREQUENCY_LABELS,
  UNUSED_LABELS,
} from "@/utils/leakage-calculator";

/**
 * CalculatorForm
 *
 * Renders all four input fields for the leakage calculator.
 * Fully controlled: all state lives in the parent.
 *
 * @param {{ inputs: import('@/utils/leakage-calculator').CalculatorInputs, onChange: (updates: Partial<import('@/utils/leakage-calculator').CalculatorInputs>) => void, onCalculate: () => void }} props
 */
export default function CalculatorForm({ inputs, onChange, onCalculate }) {
  const {
    subscriptionCount,
    averageCost,
    reviewFrequency,
    unusedSubscriptions,
  } = inputs;

  const handleCustomCost = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) onChange({ averageCost: val });
  };

  const isPresetCost = COST_PRESETS.includes(averageCost);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-10">
      <h2 className="text-xl font-bold text-[#111] mb-8">
        Enter your subscription details
      </h2>

      {/* 1. Number of subscriptions */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Number of subscriptions
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Include all recurring payments — streaming, software, fitness, news,
          etc.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={20}
            value={subscriptionCount}
            onChange={(e) =>
              onChange({ subscriptionCount: parseInt(e.target.value, 10) })
            }
            className="range range-primary flex-1"
            step={1}
          />
          <span className="text-2xl font-bold text-primary tabular-nums w-10 text-right">
            {subscriptionCount}
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-gray-300 mt-1 px-0.5">
          <span>1</span>
          <span>10</span>
          <span>20</span>
        </div>
      </div>

      {/* 2. Average monthly cost */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Average monthly cost per subscription
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Think about the typical charge — not your most expensive or cheapest.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {COST_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange({ averageCost: preset })}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                averageCost === preset
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              ${preset}
            </button>
          ))}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
              $
            </span>
            <input
              type="number"
              min={1}
              placeholder="Other"
              value={isPresetCost ? "" : averageCost}
              onChange={handleCustomCost}
              className={`pl-7 pr-3 py-2 rounded-lg text-sm font-semibold border w-24 outline-none transition-colors ${
                !isPresetCost
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 bg-white text-gray-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* 3. Review frequency */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          How often do you review your subscriptions?
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Reviewing more often means catching unwanted charges sooner.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(REVIEW_FREQUENCY_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ reviewFrequency: value })}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold border text-center transition-colors ${
                reviewFrequency === value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Unused subscriptions */}
      <div className="mb-10">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Are you currently paying for subscriptions you don&apos;t use?
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Forgotten free trials, duplicate services, or unused memberships.
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(UNUSED_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ unusedSubscriptions: value })}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                unusedSubscriptions === value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onCalculate}
        className="w-full py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors shadow-sm"
      >
        Calculate My Leakage
      </button>
    </div>
  );
}
