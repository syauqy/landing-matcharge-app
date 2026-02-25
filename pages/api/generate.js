import { generateKeywords, generateArticle } from "@/lib/ai";
import { buildMDX } from "@/lib/blog";
import { commitFile, getExistingFiles, getFileContent } from "@/lib/github";
import matter from "gray-matter";

// const IS_MANUAL_TEST = process.env.NODE_ENV === "development";
const CLUSTER = "subscription-tracking";
const MAX_ARTICLES = 40;
const DAILY_LIMIT = 1;
// const DAILY_LIMIT = IS_MANUAL_TEST ? 0 : 1;
const SEED = "tracking subscriptions on iphone";

/**
 * Fetch title + slug for existing cluster posts (used for internal linking).
 * Falls back gracefully if individual file reads fail.
 */
async function getSiblingPosts(existingSlugs) {
  const results = [];
  for (const slug of existingSlugs) {
    try {
      const raw = await getFileContent(`contents/blog/${CLUSTER}/${slug}.mdx`);
      const { data } = matter(raw);
      if (data.title && data.slug) {
        results.push({ slug: data.slug, title: data.title });
      }
    } catch {
      results.push({ slug, title: slug.replace(/-/g, " ") });
    }
  }
  return results;
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get existing articles
    const existingSlugs = await getExistingFiles(`contents/blog/${CLUSTER}`);

    if (existingSlugs.length >= MAX_ARTICLES) {
      return res.status(200).json({
        message: "Max articles reached. Generation stopped.",
      });
    }

    // Load sibling post metadata for internal link injection
    const siblingPosts = await getSiblingPosts(existingSlugs);

    // Generate keywords (avoid duplicates)
    const keywords = await generateKeywords(SEED, existingSlugs);

    console.log("Generated keywords:", keywords);

    for (const keyword of keywords.slice(0, DAILY_LIMIT)) {
      const article = await generateArticle(keyword);

      const { slug, content } = buildMDX(keyword, article, siblingPosts);

      // Prevent duplicate slug
      if (existingSlugs.includes(slug)) continue;
      console.log("Generated article for:", keyword);
      await commitFile(`contents/blog/${CLUSTER}/${slug}.mdx`, content);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
