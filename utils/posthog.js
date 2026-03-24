let posthog = null;
let posthogPromise = null;

const initPostHog = async () => {
  if (posthog !== null) return; // Already initialized
  if (typeof window === "undefined") return; // Not in browser

  const { default: posthogWeb } = await import("posthog-js");

  posthogWeb.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    persistence: "localStorage+cookie",
  });

  posthog = posthogWeb;
};

// Create a promise that resolves when PostHog is initialized
const getPostHog = async () => {
  if (posthog) return posthog;

  if (!posthogPromise) {
    posthogPromise = initPostHog();
  }

  await posthogPromise;
  return posthog;
};

// Track App Store click events
const trackAppStoreClick = (source = "unknown") => {
  if (posthog) {
    posthog.capture("app_store_click", {
      source,
      timestamp: new Date().toISOString(),
    });
  }
};

export { initPostHog, getPostHog, trackAppStoreClick, posthog };
