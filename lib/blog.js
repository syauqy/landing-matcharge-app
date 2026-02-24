export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function estimateReadingTime(text) {
  return Math.ceil(text.split(/\s+/).length / 200);
}

export function buildMDX(keyword, body) {
  const slug = slugify(keyword);
  const readingTime = estimateReadingTime(body);

  const CTA = `
## Take Control of Your Subscriptions

Matcharge helps you track recurring payments in one clean calendar view.

[Download Matcharge →](https://matcharge.app)
`;

  const finalBody = body.replace("{{CTA_BLOCK}}", CTA);

  return {
    slug,
    content: `---
title: "${keyword}"
slug: "${slug}"
description: "Learn ${keyword} with step-by-step guidance."
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
