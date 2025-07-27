import React, { useState } from "react";
import Markdown from "markdown-to-jsx";
import clsx from "clsx";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getJavaneseDate } from "@/utils";

export function MonthlyReadingSection({ monthlyReading }) {
  if (!monthlyReading) return null;
  const reading = monthlyReading?.reading;
  const javaneseDate = monthlyReading?.created_at
    ? getJavaneseDate(
        format(new Date(monthlyReading?.created_at), "yyyy-MM-dd")
      )
    : "";

  let formattedDate = "Date unavailable";

  try {
    formattedDate = monthlyReading?.created_at
      ? format(new Date(monthlyReading?.created_at), "MMMM yyyy")
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
          <div className="space-y-1">
            <p className="text-lg font-semibold">🌙 Monthly Reading</p>
            <div className="font-medium">
              <span className="text-rose-600">{formattedDate}</span> - Month of{" "}
              {javaneseDate?.monthName}, Year of {javaneseDate?.yearName}
            </div>
          </div>

          <p className="text-xl font-semibold leading-7">
            {reading?.summary?.core_theme}
          </p>
          <p className="text-base mb-3">{reading?.summary?.description}</p>
          <Link
            className="btn bg-rose-500 active:bg-rose-700 text-white  font-semibold rounded-2xl"
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
