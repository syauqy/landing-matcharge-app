import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabaseClient";
import { toast } from "sonner";

export function useSubscription() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const checkProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "weton, id, full_name, weton, gender, username, wuku, birth_date"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error("Error fetching profile:", profileError);
        router.push("/profile-setup");
      }
      setProfileData(profile);
    } catch (err) {
      console.error("Error checking profile:", err);
      setError("Failed to check profile.");
      setLoading(false);
    }
    setLoading(false);
  }, [user]);

  const presentPaywall = useCallback(async () => {
    if (!user || isProcessing) return;

    setIsProcessing(true);
    try {
      const { Purchases, LOG_LEVEL } = await import(
        "@revenuecat/purchases-capacitor"
      );
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({
        apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY,
        appUserID: user.id,
      });
      await Purchases.setEmail(user.email);
      await Purchases.setDisplayName(user.user_metadata?.full_name || "");

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
        const { error } = await supabase
          .from("profiles")
          .update({ subscription: "pro" })
          .eq("id", user.id);

        if (error) throw error;

        await checkProfile();
        toast.success("Success! Your subscription is active.");
      }
    } catch (e) {
      console.error("Paywall presentation error:", e);
      toast.error("An error occurred while showing the paywall.");
    } finally {
      setIsProcessing(false);
    }
  }, [user, isProcessing, checkProfile]);

  return { presentPaywall, isProcessing };
}
