import "@/styles/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { DefaultSeo } from "next-seo";
import SEO from "@/next-seo.config";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <DefaultSeo {...SEO} />
      <NuqsAdapter>
        <Component {...pageProps} />
      </NuqsAdapter>
    </>
  );
}
