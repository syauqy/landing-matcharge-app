/**
 * Next SEO Configuration
 * Default SEO settings for the entire site
 */

const config = {
  titleTemplate: "%s - Matcharge",
  defaultTitle: "Matcharge - Track Your Subscriptions & Bills",
  description:
    "Track recurring bills, catch forgotten subscription trials, and visualize your spending with Matcharge. Find your financial calm.",
  canonical: "https://www.matcharge.app",
  mobileAlternate: {
    media: "only screen and (max-width: 640px)",
    href: "https://m.matcharge.app",
  },
  languageAlternates: [
    {
      hrefLang: "en-US",
      href: "https://www.matcharge.app",
    },
    {
      hrefLang: "x-default",
      href: "https://www.matcharge.app",
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.matcharge.app",
    siteName: "Matcharge",
    images: [
      {
        url: "https://www.matcharge.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Matcharge - Track Your Subscriptions & Bills",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    handle: "@matcharge",
    site: "@matcharge",
    cardType: "summary_large_image",
  },
  robotsProps: {
    nosnippet: false,
    notranslate: false,
    noimageindex: false,
    noarchive: false,
    maxSnippet: -1,
    maxImagePreview: "large",
    maxVideoPreview: -1,
  },
};

export default config;
