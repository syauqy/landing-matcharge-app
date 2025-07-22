import React from "react";
import Markdown from "markdown-to-jsx";
import clsx from "clsx";

export default function MonthlyReadingSection({ monthlyReading }) {
  if (!monthlyReading) return null;
  const reading = monthlyReading?.reading;

  let formattedDate = "Date unavailable";

  try {
    formattedDate = monthlyReading?.created_at
      ? format(new Date(monthlyReading?.created_at), "MMMM")
      : "";
  } catch (e) {
    console.error("Error formatting monthlyReading.date:", e);
  }

  if (monthlyReading?.status === "loading") {
    return (
      <div className="card bg-base-100 border border-[var(--color-batik-border)] shadow-md">
        <div className="card-body p-4 flex items-center justify-center">
          <span className="loading loading-spinner loading-md"></span>
          <p className="ml-2">Generating your monthly reading...</p>
        </div>
      </div>
    );
  }

  if (monthlyReading?.status === "completed") {
    return (
      <div className="card bg-base-100 border border-[var(--color-batik-border)] shadow-md">
        <div className="card-body p-4">
          <p className="text-lg font-semibold">
            🌙 Monthly Reading - {formattedDate}
          </p>
          <p className="text-xl font-semibold leading-7">
            {reading?.summary?.core_theme}
          </p>
          <p className="text-base mb-3 mt-2">{reading?.summary?.description}</p>
          <Link
            className="btn bg-rose-500 text-white  font-semibold rounded-2xl"
            href={`/readings/${monthlyReading?.reading_category}/${monthlyReading?.slug}`}
          >
            Read More
            <ArrowRight className="ml-1 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }
}
