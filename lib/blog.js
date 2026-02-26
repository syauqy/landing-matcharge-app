export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function estimateReadingTime(text) {
  return Math.ceil(text.split(/\s+/).length / 200);
}

// Pillar page slug and varied anchor text options
const PILLAR_SLUG = "subscription-tracking-guide";
const PILLAR_ANCHORS = [
  "complete subscription tracking guide",
  "subscription tracking guide",
  "our full guide to subscription tracking",
  "definitive subscription tracking resource",
];

/**
 * Inject internal links into an article body.
 * - 1 link to the pillar page (unless already present)
 * - Up to 2 links to sibling cluster posts (deduplicated)
 *
 * Links are inserted by finding the end of the second or third paragraph
 * and appending a natural sentence with the link.
 *
 * @param {string} body - Raw MDX article body
 * @param {Array<{slug: string, title: string}>} siblingPosts - Existing cluster posts
 * @returns {string} - Body with injected links
 */
function injectInternalLinks(body, siblingPosts = []) {
  let modified = body;

  // --- 1. Pillar link (skip if already present) ---
  if (!modified.includes(PILLAR_SLUG)) {
    const anchor =
      PILLAR_ANCHORS[Math.floor(Math.random() * PILLAR_ANCHORS.length)];
    const pillarSentence = ` For a broader overview, see our [${anchor}](/blog/${PILLAR_SLUG}).`;

    // Find the end of the 2nd paragraph (after the second double-newline block)
    const paraBreaks = [];
    let idx = 0;
    while ((idx = modified.indexOf("\n\n", idx)) !== -1) {
      paraBreaks.push(idx);
      idx += 2;
    }
    // Insert after the 2nd paragraph ending, or fall back to after the 1st
    const insertAt = paraBreaks[1] ?? paraBreaks[0];
    if (insertAt !== undefined) {
      // Append sentence to the paragraph that ends at insertAt
      modified =
        modified.slice(0, insertAt) + pillarSentence + modified.slice(insertAt);
    }
  }

  // --- 2. Sibling links (up to 2, skip duplicates) ---
  // Filter siblings that are not already referenced
  const eligibleSiblings = siblingPosts.filter(
    (s) => s.slug !== PILLAR_SLUG && !modified.includes(`/blog/${s.slug}`),
  );

  // Pick up to 2 at random
  const shuffled = eligibleSiblings.sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, 2);

  chosen.forEach((sibling, i) => {
    const sentence = ` You may also find it useful to read about [${sibling.title}](/blog/${sibling.slug}).`;

    // Insert each sibling link after different paragraphs (3rd and 4th)
    const paraBreaks = [];
    let ix = 0;
    while ((ix = modified.indexOf("\n\n", ix)) !== -1) {
      paraBreaks.push(ix);
      ix += 2;
    }
    const targetBreak = paraBreaks[3 + i] ?? paraBreaks[paraBreaks.length - 1];
    if (
      targetBreak !== undefined &&
      !modified.includes(`/blog/${sibling.slug}`)
    ) {
      modified =
        modified.slice(0, targetBreak) + sentence + modified.slice(targetBreak);
    }
  });

  return modified;
}

/**
 * Capitalize first letter of each word (title case)
 */
function toTitleCase(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Clean keyword: remove leading/trailing asterisks and spaces
 */
function cleanKeyword(keyword) {
  return keyword.replace(/^\*\s*|\s*\*$/g, "").trim();
}

export function buildMDX(keyword, body, siblingPosts = []) {
  const cleanedKeyword = cleanKeyword(keyword);
  const slug = slugify(cleanedKeyword);
  const readingTime = estimateReadingTime(body);

  // Title case for the title
  const titleCased = toTitleCase(cleanedKeyword);

  // Description: lowercase first word, clean the keyword
  const descriptionKeyword =
    cleanedKeyword.charAt(0).toLowerCase() + cleanedKeyword.slice(1);

  const CTA = `
## Take Control of Your Subscriptions

Matchange helps you track recurring payments in one clean calendar view.

[Download Matchange →](https://matchange.app)
`;

  const bodyWithCTA = body.replace("{{CTA_BLOCK}}", CTA);
  const finalBody = injectInternalLinks(bodyWithCTA, siblingPosts);

  return {
    slug,
    content: `---
title: "${titleCased}"
slug: "${slug}"
description: "Learn ${descriptionKeyword} with step-by-step guidance."
date: "${new Date().toISOString().split("T")[0]}"
author: "Matcharge Team"
image: "/content/blog/images/${slug}.jpg"
status: "published"
tags:
  - subscription
  - iphone
categories:
  - subscription-tracking
readingTime: ${readingTime}
---

${finalBody}
`,
  };
}
