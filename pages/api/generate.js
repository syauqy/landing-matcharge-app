import { generateKeywords, generateArticle } from "@/lib/ai";
import { buildMDX } from "@/lib/blog";
import { commitFile, getExistingFiles } from "@/lib/github";

const IS_MANUAL_TEST = process.env.NODE_ENV === "development";
const CLUSTER = "subscription-tracking";
const MAX_ARTICLES = 40;
const DAILY_LIMIT = IS_MANUAL_TEST ? 0 : 1;
const SEED = "tracking subscriptions on iphone";

const AUTH_HEADER = req.headers.authorization;

if (AUTH_HEADER !== `Bearer ${process.env.CRON_SECRET}`) {
  return res.status(401).json({ error: "Unauthorized" });
}

export default async function handler(req, res) {
  if (req.headers["x-vercel-cron"] !== "1") {
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

    // Generate keywords (avoid duplicates)
    const keywords = await generateKeywords(SEED, existingSlugs);

    console.log("Generated keywords:", keywords);

    for (const keyword of keywords.slice(0, DAILY_LIMIT)) {
      const article = await generateArticle(keyword);

      const { slug, content } = buildMDX(keyword, article);

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
