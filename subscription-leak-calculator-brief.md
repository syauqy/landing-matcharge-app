You are implementing a growth-focused fintech tool for a SaaS app called Matcharge.

Matcharge is an iOS subscription tracking app.

This tool is NOT just a calculator.
It is a high-authority, SEO-optimized, emotionally engaging growth engine.

Your job is to implement it cleanly, production-ready, scalable, and conversion-optimized.

## PROJECT CONTEXT

Tech stack:

- Next.js (Page Router, NOT App Router)
- TailwindCSS
- DaisyUI
- Framer Motion
- NUQS for query

Design style:
Stripe-style fintech aesthetic
Following the current theme colors
Minimal
Clean white background
Subtle gray borders
Generous spacing
No gradients
No flashy colors
Trust-first visual tone

The tool must:
Be anonymous (no login)
No email capture
Be shareable via URL parameters
Be SEO optimized
Load fast
Be fully client-side calculation
Feel intelligent and trustworthy
Softly drive iOS app installs

### ROUTE

Create page:

`/subscription-leakage-calculator`

Use SSG (getStaticProps).

### TOOL NAME

Subscription Leakage Calculator

Tagline:
Estimate the hidden cost of unmanaged recurring payments.

### UX FLOW

Single-page layout with:
Hero section
Calculator card
Results section (conditionally rendered)
Educational explanation
Soft CTA to download Matcharge
FAQ section (SEO)
JSON-LD structured data

### INPUT FIELDS

Inside a clean card:

1. Number of subscriptions
   - Slider (1–20)
   - Default: 8
2. Average monthly cost
   - Button group presets: 5, 10, 15, 25
   - Optional custom input
3. Review frequency
   - Monthly
   - Every few months
   - Once a year
   - Never
4. Paying for unused subscriptions? - Yes - Not sure - No
   All inputs stored in React state.

CALCULATION LOGIC (MUST FOLLOW EXACTLY)

Base:

totalMonthly = subscriptionCount × averageCost
annualSpend = totalMonthly × 12

Leakage base by review frequency:

monthly → 0.03
few_months → 0.08
yearly → 0.12
never → 0.17

Adjustment:

If unused = yes → +0.03
If unused = not_sure → +0.015
If unused = no → +0

Leakage range:

low = annualSpend × (leakageRate - 0.02)
high = annualSpend × (leakageRate + 0.02)

Clamp minimum at 0.

Round to nearest whole dollar.

Return:

annualSpend

leakageLow

leakageHigh

monthlyLeakageAverage

DO NOT exaggerate.
Keep numbers believable.

RESULTS UI

When calculated:

Display:

Your estimated annual subscription leakage:

$X – $Y per year

Below that:

Equivalent comparisons:

weekend trip

3 months groceries

gym membership

Keep copy subtle and educational.

Add share section:

Generate shareable URL with query params:

?subs=8&cost=15&review=never&unused=yes

On page load:

If params exist → auto populate inputs

Auto show results

Add "Copy Link" button.

CTA SECTION

Below results:

Title:
Tracking recurring payments consistently eliminates most subscription leakage.

Bullet points:

Track every recurring payment

See upcoming charges

Calendar view of renewals

Get reminders before billing

Primary button:
Download on the App Store

Secondary link:
Learn how subscription leakage happens (internal link to blog pillar)

SEO REQUIREMENTS

Meta title:
Subscription Leakage Calculator | Matcharge

Meta description:
Estimate how much money you may be losing to unmanaged subscriptions. Free anonymous subscription cost calculator by Matcharge.

Add structured data:

WebApplication schema

FAQPage schema

Add canonical tag.

Include FAQ section with 4–5 questions:

How is leakage estimated?

Is this tool accurate?

Why do subscriptions go unnoticed?

How can I reduce subscription waste?

Is this anonymous?

ANIMATION RULES

Use Framer Motion:

Fade in sections on scroll

Smooth number animation when showing results

Subtle hover effects on buttons

No over-animation.
Keep it professional.

DESIGN RULES

Use Tailwind + DaisyUI.

Card:
rounded-xl
border border-gray-200
shadow-sm
bg-white

Spacing:
max-w-4xl mx-auto px-6 py-16

Typography:
Large bold headline
Muted gray subtext

No gradients.
No flashy colors.
Primary color: subtle emerald accent.

PERFORMANCE

No API calls

No server logic

Pure client calculation

Lightweight

No heavy libraries

INTERNAL LINKING

Add contextual link to:

Subscription tracking pillar page

Related blog articles

This tool must strengthen SEO cluster.

CODE QUALITY

TypeScript

Clear types

Modular components:

CalculatorForm

ResultsPanel

FAQSection

ShareSection

Extract calculation logic into separate util file

Clean readable code

No console logs

No unused code

FUTURE EXTENSIBILITY

Code in a way that allows:

Adding country-specific assumptions

Adding aggregated anonymous stats later

Tracking events later

Do not hardcode UI text inside logic.

TONE

The tool must feel:

Intelligent

Calm

Data-backed

Trustworthy

Financially literate

NOT:

Clickbait

Scary

Manipulative

Exaggerated

OUTPUT

Implement full page with:

All components

Logic

SEO

Share functionality

Clean structure

Production-ready code

Do not leave TODOs.

This is a core growth asset for a fintech SaaS.
