let posthog = null;

const initPostHog = async () => {
  if (typeof window !== "undefined") {
    const { default: posthogWeb } = await import("posthog-js");

    posthogWeb.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      persistence: "cookie",
    });

    posthog = posthogWeb;
  }
};

export { initPostHog, posthog };
