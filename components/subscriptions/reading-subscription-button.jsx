import React from "react";
import { useSubscription } from "@/utils/useSubscription";

export function ReadingSubscriptionButton() {
  const { presentPaywall, isProcessing } = useSubscription();
  return (
    <div className="fixed bottom-0 w-full p-2 pb-10 bg-base-100 border-batik-border shadow-[0px_-4px_12px_0px_rgba(0,_0,_0,_0.1)]">
      <button
        className="btn bg-amber-600 font-semibold text-white rounded-xl w-full"
        onClick={() => presentPaywall()}
      >
        🔓 Unlock With Pro
      </button>
    </div>
  );
}
