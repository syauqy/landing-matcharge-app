import React, { useEffect, useState } from "react";
import Link from "next/link";
import { NextSeo, ArticleJsonLd, BreadcrumbJsonLd } from "next-seo";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import BlogHeader from "@/components/blog/BlogHeader";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedArticles from "@/components/blog/RelatedArticles";

const CANONICAL = "https://matcharge.app/blog/subscription-tracking-guide";

export default function SubscriptionTrackingGuidePage({ clusterPosts }) {
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
        title="The Complete Guide to Tracking Subscriptions on iPhone"
        description="The definitive resource for tracking subscriptions, managing recurring bills, catching forgotten trials, and mastering your finances on iPhone."
        canonical={CANONICAL}
        openGraph={{
          type: "article",
          url: CANONICAL,
          title: "The Complete Guide to Tracking Subscriptions on iPhone",
          description:
            "The definitive resource for tracking subscriptions, managing recurring bills, catching forgotten trials, and mastering your finances on iPhone.",
          images: [
            {
              url: "https://matcharge.app/og-default.jpg",
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
        title="The Complete Guide to Tracking Subscriptions on iPhone"
        images={["https://matcharge.app/og-default.jpg"]}
        datePublished="2026-01-01T00:00:00Z"
        dateModified={new Date().toISOString()}
        authorName={["Matcharge Team"]}
        description="The definitive resource for tracking subscriptions, managing recurring bills, catching forgotten trials, and mastering your finances on iPhone."
      />

      <BreadcrumbJsonLd
        itemListElements={[
          { position: 1, name: "Home", item: "https://matcharge.app" },
          { position: 2, name: "Blog", item: "https://matcharge.app/blog" },
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
                title="The Complete Guide to Tracking Subscriptions on iPhone"
                description="Subscriptions are the new silent budget killers. This guide covers every method, tool, and habit to stay in full control of your recurring charges — from built-in iPhone tools to dedicated apps like Matcharge. Updated regularly."
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
                      The "subscription economy" has quietly rewired how
                      software, media, and services are sold. Monthly charges
                      feel trivially small ($4.99 here, $9.99 there) until you
                      see the total: often $80–$150/month or more.
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
                      For a deeper walkthrough, see our guide on{" "}
                      <Link
                        href="/blog/see-apple-subscriptions"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        how to see all Apple subscriptions
                      </Link>
                      .
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
                    <H3>Email Inbox Auditing</H3>
                    <P>
                      Search your email for "receipt", "invoice",
                      "subscription", "billing". Sort by sender to identify
                      every service you've ever subscribed to. This one-time
                      audit is often eye-opening.
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
                      The trickiest subscriptions are the ones you've completely
                      forgotten about. Here's a systematic process to surface
                      them:
                    </P>
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
                      We cover this in depth in our article on{" "}
                      <Link
                        href="/blog/finding-forgotten-monthly-subscriptions-directly-on-your-iphone"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        finding forgotten monthly subscriptions on iPhone
                      </Link>
                      .
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
                        href="https://matcharge.app"
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
                      a="Yes. If you haven't used a service in 30+ days, cancel it. You can always re-subscribe. The decision costs nothing; keeping an unused subscription costs money every month."
                    />
                  </Section>

                  <Divider />

                  {/* CTA */}
                  <Section id="get-started">
                    <div className="bg-[#111] rounded-2xl px-8 py-10 text-center">
                      <p className="text-white text-[1.375rem] font-semibold leading-snug mb-3">
                        Ready to take control of your subscriptions?
                      </p>
                      <p className="text-gray-400 text-sm mb-6">
                        Matcharge gives you a calm, visual view of every
                        recurring charge. No bank connection required.
                      </p>
                      <a
                        href="https://apps.apple.com/app/matcharge/id6752604627"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
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
        {clusterPosts.length > 0 && (
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
  const { getAllBlogPosts } = await import("@/utils/blog");
  const allPosts = getAllBlogPosts();
  const clusterPosts = allPosts
    .filter((p) =>
      p.categories?.some((c) => c.toLowerCase().includes("subscription")),
    )
    .slice(0, 6)
    .map(({ content, ...rest }) => rest); // strip content to keep props lean

  return {
    props: { clusterPosts },
    revalidate: 3600,
  };
}
