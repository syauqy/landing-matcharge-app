import "@/styles/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { DefaultSeo } from "next-seo";
import SEO from "@/next-seo.config";
import { useEffect } from "react";
import { initPostHog } from "@/utils/posthog";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize PostHog on app load
    initPostHog();
  }, []);

  return (
    <>
      <DefaultSeo {...SEO} />
      <NuqsAdapter>
        <Component {...pageProps} />
      </NuqsAdapter>
    </>
  );
}
