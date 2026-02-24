require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildPrompt } = require("./prompt");
const keywords = require("../data/keywords.json");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function generateKeywords(seed) {
  const prompt = `
Generate 10 long-tail SEO blog keywords related to:
"${seed}"

Rules:
- Low competition
- Long-tail
- Specific
- No generic finance terms
- Return as plain list
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return text
    .split("\n")
    .map((line) => line.replace(/^\d+[\).\s-]*/, "").trim())
    .filter(Boolean);
}

function estimateReadingTime(text) {
  const words = text.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function generateTags(keyword) {
  const base = keyword.split(" ");
  return base.slice(0, 3);
}

function buildMDX(body, item) {
  const readingTime = estimateReadingTime(body);

  const title = item.keyword.charAt(0).toUpperCase() + item.keyword.slice(1);

  const slug = item.slug || slugify(item.keyword);

  return `---
title: "${title}"
slug: "${slug}"
description: "Learn ${item.keyword} with step-by-step guidance."
date: "${new Date().toISOString().split("T")[0]}"
author: "Matcharge Team"
image: "/content/blog/images/${slug}.jpg"
status: "published"
tags:
  - ${generateTags(item.keyword).join("\n  - ")}
categories:
  - ${item.cluster}
readingTime: ${readingTime}
---

${body}
`;
}

function injectPlaceholders(content) {
  const CTA = `
## Take Control of Your Subscriptions

Matcharge helps you track recurring payments in one clean calendar view — so you never get surprised by renewals again.

[Download Matcharge →](https://matcharge.app)
`;

  const internalLink1 = `[See how to track subscriptions on iPhone](/blog/how-to-track-subscriptions-iphone)`;

  const internalLink2 = `[Learn how to see Apple subscriptions](/blog/see-apple-subscriptions)`;

  return content
    .replace("{{CTA_BLOCK}}", CTA)
    .replace("{{INTERNAL_LINK_1}}", internalLink1)
    .replace("{{INTERNAL_LINK_2}}", internalLink2);
}

async function generateArticle(item) {
  console.log(`Generating: ${item.keyword}`);

  const prompt = buildPrompt(item.keyword);

  const result = await model.generateContent(prompt);
  const content = result.response.text();

  const finalContent = injectPlaceholders(content);
  const mdx = buildMDX(finalContent, item);

  const outputDir = path.join(process.cwd(), "contents/blog", item.cluster);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${item.slug}.mdx`);
  fs.writeFileSync(outputPath, mdx);

  console.log(`Saved: ${outputPath}`);
}

async function run() {
  const BATCH_SIZE = 5; // Control how many generate per run
  const batch = keywords.slice(0, BATCH_SIZE);

  for (const item of batch) {
    await generateArticle(item);
  }
}

run();
