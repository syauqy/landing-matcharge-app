import { ArrowRight } from "lucide-react";
import React from "react";
import { useSubscription } from "@/utils/useSubscription";

export function SubscriptionBannerHome() {
  const { presentPaywall, isProcessing } = useSubscription();

  return (
    <div className="p-4 flex flex-col gap-2">
      <button
        onClick={presentPaywall}
        disabled={isProcessing}
        className="card bg-batik border border-batik-border shadow w-full text-left disabled:opacity-50"
      >
        <div className="flex flex-row items-center gap-2 p-4">
          <div className="text-2xl">🔓</div>
          <div className="flex-grow">
            <div className="text-sm font-semibold">Unlock My Weton's Power</div>
            <div className="text-slate-700 text-xs">
              Move beyond the surface and harness the true energetic power of
              your Weton.
            </div>
          </div>
          <ArrowRight className="size-10 text-batik-text" />
        </div>
      </button>
    </div>
  );
}
