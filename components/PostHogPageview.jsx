import { useRouter } from "next/router";
import { useEffect } from "react";
import { posthog } from "@/utils/posthog";

export function PostHogPageview() {
  const router = useRouter();

  // Track page views
  useEffect(() => {
    if (!posthog) return;

    const handleRouteChange = (url) => {
      posthog.capture("$pageview", {
        $current_url: url,
      });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return null;
}
