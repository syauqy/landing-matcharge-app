import { ArrowRight } from "lucide-react";
import React, { useEffect } from "react";
import { Toaster, toast } from "sonner";

export function Paywall({ user, checkProfile }) {
  const handleSubscription = async () => {
    try {
      const { RevenueCatUI } = await import(
        "@revenuecat/purchases-capacitor-ui"
      );
      const { PAYWALL_RESULT } = await import(
        "@revenuecat/purchases-capacitor"
      );
      const { result } = await RevenueCatUI.presentPaywall();

      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED
      ) {
        // Re-fetch profile data to get updated subscription status
        await checkProfile();
        toast.success("Success! Your subscription is active.");
      }
    } catch (e) {
      console.error("Paywall presentation error:", e);
      toast.error("An error occurred while showing the paywall.");
    }
  };

  useEffect(() => {
    if (!user) return;
    (async function () {
      const { Purchases, LOG_LEVEL } = await import(
        "@revenuecat/purchases-capacitor"
      );
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG }); // Enable to get debug logs
      await Purchases.configure({
        apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY,
        appUserID: user.id,
      });
    })();
  }, [user]);
  return (
    <div className="p-4 flex flex-col gap-2">
      <button
        onClick={handleSubscription}
        className="card bg-base-100 border border-rose-200 shadow w-full text-left"
      >
        <div className="flex flex-row items-center gap-2 p-4">
          <div className="text-4xl">🔓</div>
          <div className="flex-grow">
            <div className="text-sm font-semibold">Unlock My Weton's Power</div>
            <div className="text-slate-700 text-xs">
              Move beyond the surface and harness the true energetic power of
              your Weton.
            </div>
          </div>
          <ArrowRight className="text-rose-400" />
        </div>
      </button>
    </div>
  );
}
