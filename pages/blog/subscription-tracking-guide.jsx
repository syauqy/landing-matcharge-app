import React, { useEffect, useState } from "react";
import Link from "next/link";
import { NextSeo, ArticleJsonLd, BreadcrumbJsonLd } from "next-seo";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import BlogHeader from "@/components/blog/BlogHeader";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedArticles from "@/components/blog/RelatedArticles";
import { trackAppStoreClick } from "@/utils/posthog";

const CANONICAL = "https://www.matcharge.app/blog/subscription-tracking-guide";

export default function SubscriptionTrackingGuidePage({ clusterPosts = [] }) {
  const [activeHeading, setActiveHeading] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = document.querySelectorAll("h2, h3");
      let current = null;
      for (const heading of headingElements) {
        const rect = heading.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2) {
          current = heading.id;
        } else {
          break;
        }
      }
      setActiveHeading(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tocHeadings = [
    { id: "why-track", text: "Why It Matters", children: [] },
    { id: "reality-gap", text: "Why People Miss Subscriptions", children: [] },
    { id: "simple-system", text: "3-Step System", children: [] },
    { id: "quick-win", text: "Quick Win: 30 Seconds", children: [] },
    {
      id: "iphone-built-in",
      text: "iPhone Built-in Tools",
      children: [
        {
          id: "apple-subscriptions",
          text: "Apple Subscriptions",
          children: [],
        },
        {
          id: "purchase-history",
          text: "App Store Purchase History",
          children: [],
        },
      ],
    },
    {
      id: "manual-tracking",
      text: "Manual Tracking",
      children: [
        { id: "spreadsheet", text: "The Spreadsheet Method", children: [] },
        { id: "reminders", text: "iOS Reminders / Calendar", children: [] },
      ],
    },
    {
      id: "finding-forgotten",
      text: "Find Forgotten Subscriptions",
      children: [
        { id: "bank-statement", text: "Bank Statement Method", children: [] },
      ],
    },
    { id: "dedicated-app", text: "Using a Tracker App", children: [] },
    { id: "best-practices", text: "Best Practices", children: [] },
    { id: "faq", text: "FAQ", children: [] },
  ];

  return (
    <>
      <NextSeo
        title="How to Track All Your iPhone Subscriptions (And Find Ones You Can Cancel Today)"
        description="Complete guide to finding every subscription—App Store, third-party services, hidden charges—and the system to track them all in one place."
        canonical={CANONICAL}
        languageAlternates={[
          {
            hrefLang: "en-US",
            href: CANONICAL,
          },
        ]}
        openGraph={{
          type: "article",
          url: CANONICAL,
          title:
            "How to Track All Your iPhone Subscriptions (And Find Ones You Can Cancel Today)",
          description:
            "Complete guide to finding every subscription—App Store, third-party services, hidden charges—and the system to track them all in one place.",
          images: [
            {
              url: "https://www.matcharge.app/og-default.jpg",
              width: 1200,
              height: 630,
              alt: "Subscription Tracking Guide – Matcharge",
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content:
              "subscription tracking, track subscriptions iphone, manage recurring bills, cancel free trials, budget subscriptions, subscription manager",
          },
        ]}
      />

      <ArticleJsonLd
        url={CANONICAL}
        title="How to Track All Your iPhone Subscriptions (And Find Ones You Can Cancel Today)"
        images={["https://www.matcharge.app/og-default.jpg"]}
        datePublished="2026-01-01T00:00:00Z"
        dateModified={new Date().toISOString()}
        authorName={["Matcharge Team"]}
        description="Complete guide to finding every subscription—App Store, third-party services, hidden charges—and the system to track them all in one place."
      />

      <BreadcrumbJsonLd
        itemListElements={[
          { position: 1, name: "Home", item: "https://www.matcharge.app" },
          { position: 2, name: "Blog", item: "https://www.matcharge.app/blog" },
          {
            position: 3,
            name: "Subscription Tracking Guide",
            item: CANONICAL,
          },
        ]}
      />

      <Navbar bg="bg-white" page="blog" />

      <main className="bg-white">
        {/* Back Button */}
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Blog Header — matches [slug].jsx exactly */}
        <div className="border-b border-gray-100 py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-[820px]">
              <BlogHeader
                title="How to Track All Your iPhone Subscriptions (And Find Ones You Can Cancel Today)"
                description="Master subscription tracking on iPhone. Learn where to find every subscription—App Store, third-party services, and automatic renewals—plus how to cancel what you don't use."
                date="2026-01-01"
                author="Matcharge Team"
                readingTime={18}
                categories={["subscription-tracking"]}
                tags={["subscription", "iphone", "budget"]}
              />
            </div>
          </div>
        </div>

        {/* Content + TOC */}
        <div className="bg-[#fafafa] py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex gap-14 items-start">
              {/* Main Article */}
              <article className="flex-1 min-w-0 max-w-[820px]">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-5 py-8 md:px-12 md:py-12">
                  {/* Section 1 */}
                  <Section id="why-track">
                    <H2>Why Subscription Tracking Matters</H2>
                    <P>
                      The average person pays for{" "}
                      <strong>8–12 active subscriptions</strong> at any given
                      time — but studies suggest they can only name 3–4 of them.
                      Most people only check their subscriptions when they
                      notice a charge — but by then, it's already renewed. The
                      "subscription economy" has quietly rewired how software,
                      media, and services are sold. Monthly charges feel
                      trivially small ($4.99 here, $9.99 there) until you see
                      the total: often $80–$150/month or more.
                    </P>
                    <P>The biggest risks of not tracking:</P>
                    <UL>
                      <li>
                        <strong>Zombie subscriptions</strong> — services you
                        forgot but never cancelled
                      </li>
                      <li>
                        <strong>Trial-to-paid traps</strong> — free trials
                        auto-converting while you're not watching
                      </li>
                      <li>
                        <strong>Price creep</strong> — services quietly raising
                        prices on existing subscribers
                      </li>
                      <li>
                        <strong>Duplicate services</strong> — paying for two
                        apps that do the same thing
                      </li>
                    </UL>
                    <P>
                      Tracking fixes all of these. Once you have visibility, you
                      have control.
                    </P>
                  </Section>

                  <Divider />

                  {/* Section 1b: Reality Gap */}
                  <Section id="reality-gap">
                    <H2>Why Most People Still Miss Subscriptions</H2>
                    <P>
                      Even when people know where to look, they still miss
                      subscriptions. The reason is simple:{" "}
                      <strong>
                        subscriptions today are fragmented across different
                        systems
                      </strong>
                      .
                    </P>
                    <P>
                      Apple only shows subscriptions billed through your Apple
                      ID. But many services—like Netflix, Spotify, newsletter
                      memberships, or direct integrations—are billed directly by
                      the company using their own payment systems. See our
                      detailed guide on{" "}
                      <Link
                        href="/blog/manual-iphone-subscription-tracking-for-non-app-store-services"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        finding subscriptions outside Apple
                      </Link>
                      .
                    </P>
                    <P>
                      This creates a blind spot. You check Apple Settings,
                      assume you're seeing everything, and miss charges that
                      never appear there. Most users don't have a single place
                      to see all subscriptions—that's where money leaks happen.
                    </P>
                    <P>
                      The good news: once you understand this gap, finding them
                      becomes straightforward. That's what this guide walks you
                      through.
                    </P>
                  </Section>

                  <Divider />

                  {/* Section 1c: Quick System */}
                  <Section id="simple-system">
                    <H2>The 3-Step System to Track Every Subscription</H2>
                    <P>
                      Most people look in one place. That's why they miss
                      subscriptions. Here's the complete system:
                    </P>
                    <OL>
                      <li>
                        <strong>Check Apple Subscriptions</strong> — for
                        services billed through your Apple ID (App Store apps)
                      </li>
                      <li>
                        <strong>
                          Audit bank statements &amp; email receipts
                        </strong>{" "}
                        — for everything billed directly (Netflix, Spotify,
                        memberships)
                      </li>
                      <li>
                        <strong>Track everything in one place</strong> — so
                        nothing gets missed at renewal time
                      </li>
                    </OL>
                    <P>
                      Most people stop at step 1. That's the subscription leak.
                    </P>
                  </Section>

                  <Divider />

                  {/* Quick Win */}
                  <Section id="quick-win">
                    <H2>Quick Win: Check This First (30 Seconds)</H2>
                    <P>If you only do one thing, do this right now:</P>
                    <OL>
                      <li>
                        Go to{" "}
                        <strong>Settings → [Your Name] → Subscriptions</strong>
                      </li>
                      <li>Look for anything you don't recognize</li>
                      <li>Check renewal dates for upcoming trials</li>
                    </OL>
                    <P>
                      Most people find at least one subscription they forgot
                      about within seconds. Many discover ones they didn't know
                      had renewed.
                    </P>
                  </Section>

                  <Divider />

                  {/* Section 2 */}
                  <Section id="iphone-built-in">
                    <H2>iPhone Built-in Tools for Subscription Tracking</H2>
                    <P>
                      Before reaching for a third-party app, your iPhone already
                      has tools that surface many of your subscriptions.
                    </P>
                    <H3 id="apple-subscriptions">
                      Apple Subscriptions (via Settings)
                    </H3>
                    <P>The most direct method for App Store subscriptions:</P>
                    <OL>
                      <li>
                        Open <strong>Settings</strong>
                      </li>
                      <li>
                        Tap your <strong>Apple ID name</strong> at the top
                      </li>
                      <li>
                        Select <strong>Subscriptions</strong>
                      </li>
                    </OL>
                    <P>
                      This shows every active and recently expired subscription
                      billed through Apple. You can manage, pause, or cancel
                      from here. However, it only shows Apple-billed
                      subscriptions — not Spotify, Netflix billed directly, or
                      website memberships.
                    </P>
                    <P>
                      However, this only shows subscriptions billed through
                      Apple. For a comprehensive guide on Apple subscriptions
                      specifically, see our full resource on{" "}
                      <Link
                        href="/blog/see-apple-subscriptions"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        how to see all your Apple subscriptions (including ones
                        you might have missed)
                      </Link>
                      . The critical point: Apple Settings is step 1 only.
                    </P>
                    <H3 id="purchase-history">App Store Purchase History</H3>
                    <P>
                      Go to{" "}
                      <strong>App Store → Account → Purchase History</strong>.
                      This shows every charge Apple has billed, useful for
                      spotting recent trial conversions you may have missed.
                    </P>
                    <H3>Screen Time Usage Reports</H3>
                    <P>
                      Indirectly useful: if you're paying for an app but Screen
                      Time shows 0 minutes of usage per week, it's a strong
                      signal to cancel.
                    </P>
                  </Section>

                  <Divider />

                  {/* Section 3 */}
                  <Section id="manual-tracking">
                    <H2>Manual Tracking Methods That Actually Work</H2>
                    <P>
                      Many personal finance enthusiasts prefer manual tracking
                      for full control and awareness. Done right, it's
                      surprisingly effective.
                    </P>
                    <H3 id="spreadsheet">The Spreadsheet Method</H3>
                    <P>
                      A simple spreadsheet with columns for: Service Name,
                      Monthly Cost, Billing Date, Payment Method, and Notes
                      (e.g., "trial ends March 1") is highly effective. Use
                      Apple Numbers or Google Sheets. Review it monthly.
                    </P>
                    <H3 id="reminders">iOS Reminders / Calendar</H3>
                    <P>
                      Set recurring reminders 3 days before each subscription's
                      renewal date. This gives you enough time to cancel if
                      needed. Simple but effective for people with fewer than 10
                      subscriptions.
                    </P>
                    <P>
                      Learn the detailed process in our guide on{" "}
                      <Link
                        href="/blog/track-trial-subscriptions-expiring-on-iphone-calendar"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        how to track trial subscriptions expiring on your iPhone
                        calendar
                      </Link>
                      .
                    </P>
                    <H3>Email Inbox Auditing</H3>
                    <P>
                      Search your email for "receipt", "invoice",
                      "subscription", "billing". Sort by sender to identify
                      every service you've ever subscribed to. This one-time
                      audit is often eye-opening.
                    </P>
                    <H3>iOS Shortcuts & Automation</H3>
                    <P>
                      For tech-savvy users, iOS Shortcuts can automate much of
                      the subscription management process. Set up reminders,
                      calendar events, and alerts through automated workflows.
                      This is more advanced but powerful for keeping everything
                      in sync across your devices.
                    </P>
                    <P>
                      Explore automation options in our guide on{" "}
                      <Link
                        href="/blog/streamlining-subscription-management-on-iphone-with-automation-shortcuts"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        streamlining subscription management with iOS automation
                        shortcuts
                      </Link>
                      .
                    </P>
                    <P>
                      For non-App Store services (like Netflix, Spotify,
                      newsletters), manual methods are often the only option —
                      until you use a dedicated tracker. Read our full guide on{" "}
                      <Link
                        href="/blog/manual-iphone-subscription-tracking-for-non-app-store-services"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        manual tracking for non-App Store subscriptions
                      </Link>
                      .
                    </P>
                  </Section>

                  <Divider />

                  {/* Section 4 */}
                  <Section id="finding-forgotten">
                    <H2>How to Find Forgotten Subscriptions</H2>
                    <P>
                      If you feel like you're paying for something you can't
                      identify, you're right—most forgotten subscriptions don't
                      show up in obvious places. The fastest way to find them is
                      not in your iPhone settings. It's in your bank statement
                      and email receipts.
                    </P>
                    <P>Here's the systematic process to surface them:</P>
                    <H3 id="bank-statement">Bank Statement Method</H3>
                    <P>
                      Download 3 months of bank/credit card statements. Scan for
                      recurring charges of the same amount appearing monthly or
                      annually. Cross-reference with what you're actually using.
                    </P>
                    <H3>PayPal / Stripe Billing Agreements</H3>
                    <P>
                      If you use PayPal, go to{" "}
                      <strong>Settings → Payments → Automatic Payments</strong>.
                      This often reveals subscriptions you completely forgot
                      about.
                    </P>
                    <H3>Google Account Review</H3>
                    <P>
                      Visit{" "}
                      <strong>
                        myaccount.google.com → Payments &amp; subscriptions
                      </strong>{" "}
                      to see anything billed through Google Play or Google
                      services.
                    </P>
                    <P>
                      See our detailed guide on{" "}
                      <Link
                        href="/blog/finding-forgotten-monthly-subscriptions-directly-on-your-iphone"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        discovering forgotten subscriptions on your iPhone
                      </Link>
                      —this covers the exact search strings and platform checks
                      that surface hidden charges most people miss.
                    </P>
                  </Section>

                  <Divider />

                  {/* Section 5 */}
                  <Section id="dedicated-app">
                    <H2>Using a Dedicated Subscription Tracker</H2>
                    <P>
                      For most people, a dedicated app is the most sustainable
                      solution. The best ones give you a visual calendar of
                      upcoming charges, alerts before renewals, and a lifetime
                      spending view.
                    </P>
                    <H3>What to Look for in a Subscription Tracker</H3>
                    <UL>
                      <li>
                        Visual billing calendar (see what's due this week/month)
                      </li>
                      <li>Reminder notifications before renewal dates</li>
                      <li>Support for any subscription (not just App Store)</li>
                      <li>
                        Multi-currency support if you subscribe to international
                        services
                      </li>
                      <li>
                        Clean, distraction-free UI that you'll actually open
                      </li>
                    </UL>
                    <H3>Matcharge</H3>
                    <P>
                      <a
                        href="https://www.matcharge.app"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        Matcharge
                      </a>{" "}
                      is designed specifically for this. It gives you a Zen
                      Garden-style visual dashboard showing all your recurring
                      charges at a glance — with Trial Detox reminders to catch
                      free trials before they convert, a billing calendar, and
                      spending charts. Available on iPhone.
                    </P>
                  </Section>

                  <Divider />

                  {/* Section 6 */}
                  <Section id="best-practices">
                    <H2>Best Practices for Subscription Hygiene</H2>
                    <P>
                      Beyond tracking, good habits are what keep subscription
                      costs under control long-term:
                    </P>
                    <UL>
                      <li>
                        <strong>Monthly audit, 10 minutes.</strong> Once a
                        month, open your tracker and ask: did I actually use
                        this? Is this worth the cost?
                      </li>
                      <li>
                        <strong>Use a dedicated card for subscriptions.</strong>{" "}
                        One credit card for all recurring charges makes auditing
                        instant and cancellation clean.
                      </li>
                      <li>
                        <strong>Set a trial alarm immediately.</strong> When you
                        sign up for any free trial, set a calendar alert for 2
                        days before it expires.
                      </li>
                      <li>
                        <strong>Annual vs monthly.</strong> If you've used a
                        service for 6+ months, switch to annual billing —
                        typically 15–40% cheaper.
                      </li>
                      <li>
                        <strong>Pause before cancel.</strong> Many services
                        offer pause options. Use them for seasonal subscriptions
                        (e.g., a fitness app in summer).
                      </li>
                    </UL>
                    <P>
                      These habits, combined with a good tracking system, can
                      recover hundreds of dollars per year with minimal effort.
                      For a comprehensive walkthrough of subscription management
                      best practices, see our full guide on{" "}
                      <Link
                        href="/blog/see-apple-subscriptions"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        managing your subscriptions end-to-end
                      </Link>
                      .
                    </P>
                  </Section>

                  <Divider />

                  {/* FAQ */}
                  <Section id="faq">
                    <H2>Frequently Asked Questions</H2>
                    <Faq
                      q="How do I see all my subscriptions on iPhone at once?"
                      a="Go to Settings → [Your Name] → Subscriptions to see App Store subscriptions. For a complete view including non-Apple services, use a dedicated app like Matcharge or audit your bank statements."
                    />
                    <Faq
                      q="How many subscriptions does the average person have?"
                      a="Research suggests 8–12 active subscriptions on average, but most people only consciously recall 3–4. The gap is where money leaks."
                    />
                    <Faq
                      q="What's the fastest way to find forgotten subscriptions?"
                      a="Search your email for 'receipt', 'invoice', and 'billing'. Then check your bank statements for recurring charges of the same amount. Cross-reference with PayPal automatic payments if applicable."
                    />
                    <Faq
                      q="Is it safe to use a subscription tracking app?"
                      a="Yes, if the app doesn't require banking credentials. Matcharge works by manual entry — you add subscriptions yourself. It never connects to your bank, so there's no security risk."
                    />
                    <Faq
                      q="Should I cancel subscriptions I'm not using?"
                      a="Yes. If you haven't used a service in 30+ days, cancel it. You can always re-subscribe. The decision costs nothing; keeping an unused subscription costs money every month. Check our guide on finding subscriptions outside Apple for services that don't show in Settings."
                    />
                    <Faq
                      q="Why don't all my subscriptions appear in Apple Settings?"
                      a="Apple Settings only shows subscriptions billed through your Apple ID. Services like Netflix, Spotify, or Hulu that you signed up for directly manage their own payments. See our guide on how to find subscriptions not listed in Apple settings for the complete process."
                    />
                  </Section>

                  <Divider />

                  {/* CTA */}
                  <Section id="get-started">
                    <div className="bg-[#111] rounded-2xl px-8 py-10 text-center">
                      <p className="text-white text-[1.375rem] font-semibold leading-snug mb-3">
                        Still missing subscriptions outside Apple?
                      </p>
                      <p className="text-gray-400 text-sm mb-6">
                        Matcharge brings everything into one place—including the
                        services Apple doesn't show. Visual calendar. Renewal
                        alerts. Full control.
                      </p>
                      <a
                        href="https://apps.apple.com/app/matcharge/id6752604627"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                        onClick={() => trackAppStoreClick("blog_guide_cta")}
                      >
                        Download Matcharge for iPhone →
                      </a>
                    </div>
                  </Section>
                </div>
              </article>

              {/* Sticky TOC — desktop only */}
              <aside className="hidden lg:block w-56 shrink-0 sticky top-[100px] self-start">
                <TableOfContents
                  headings={tocHeadings}
                  active={activeHeading}
                />
              </aside>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {clusterPosts && clusterPosts.length > 0 && (
          <div className="border-t border-gray-100 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
              <RelatedArticles
                posts={clusterPosts}
                title="More From This Guide"
              />
            </div>
          </div>
        )}
      </main>

      <Footer bg="bg-white" hideBadges />
    </>
  );
}

// --- Small local components for clean JSX ---

// --- Local components matching MDXComponents typography exactly ---

function Section({ id, children }) {
  return (
    <section id={id} className="scroll-mt-20">
      {children}
    </section>
  );
}

function Divider() {
  return <hr className="my-10 border-t border-gray-100" />;
}

function H2({ id, children }) {
  return (
    <h2
      id={id}
      className="text-[1.5rem] md:text-[1.625rem] font-bold mb-4 mt-12 pb-3 border-b border-gray-100 text-primary leading-snug tracking-tight scroll-m-20"
    >
      {children}
    </h2>
  );
}

function H3({ id, children }) {
  return (
    <h3
      id={id}
      className="text-[1.1875rem] md:text-[1.25rem] font-semibold mb-3 mt-9 text-[#111] leading-snug"
    >
      {children}
    </h3>
  );
}

function P({ children }) {
  return (
    <p className="text-[1.0625rem] leading-[1.75] mb-5 text-[#374151]">
      {children}
    </p>
  );
}

function UL({ children }) {
  return (
    <ul className="list-disc ml-6 mb-5 text-[#374151] text-[1.0625rem] leading-[1.75] space-y-1.5">
      {children}
    </ul>
  );
}

function OL({ children }) {
  return (
    <ol className="list-decimal ml-6 mb-5 text-[#374151] text-[1.0625rem] leading-[1.75] space-y-1.5">
      {children}
    </ol>
  );
}

function Faq({ q, a }) {
  return (
    <div className="mb-6">
      <H3>{q}</H3>
      <P>{a}</P>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const { getAllBlogPosts } = await import("@/utils/blog");
    const allPosts = getAllBlogPosts() || [];
    const clusterPosts = (allPosts || [])
      .filter((p) => {
        if (!p || !p.categories) return false;
        // Handle both array and empty string cases
        if (Array.isArray(p.categories)) {
          return p.categories.some((c) =>
            c.toLowerCase().includes("subscription"),
          );
        }
        return false;
      })
      .slice(0, 6)
      .map(({ content, ...rest }) => rest) // strip content to keep props lean
      .filter(Boolean); // Remove any null/undefined entries

    return {
      props: { clusterPosts: clusterPosts || [] },
      revalidate: 3600,
    };
  } catch (error) {
    console.error(
      "Error in subscription-tracking-guide getStaticProps:",
      error,
    );
    return {
      props: { clusterPosts: [] },
      revalidate: 3600,
    };
  }
}
