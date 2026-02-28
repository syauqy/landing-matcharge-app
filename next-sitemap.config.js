/** @type {import('next-sitemap').IConfig} */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.matcharge.app",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    additionalSitemaps: ["https://www.matcharge.app/sitemap.xml"],
    additionalPaths: async (config) => [
      {
        loc: "/",
        priority: 1.0,
        changefreq: "daily",
      },
    ],
  },
  exclude: ["/server-sitemap.xml", "/test", "/404", "/api"], // Exclude server routes and error pages
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.8,
  sitemapSize: 7000,
  transform: async (config, urlPath) => {
    // Determine priority based on page type
    let priority = 0.8; // Default priority
    let changefreq = "weekly";

    if (urlPath === "/") {
      priority = 1.0; // Homepage highest priority
      changefreq = "daily";
    } else if (urlPath === "/blog") {
      priority = 0.9; // Blog listing page
      changefreq = "daily";
    } else if (urlPath === "/blog/subscription-tracking-guide") {
      priority = 0.95; // Pillar page — second only to homepage
      changefreq = "weekly";
    } else if (urlPath.startsWith("/blog/")) {
      priority = 0.85; // Individual blog posts
      changefreq = "monthly";
    } else if (["privacy", "terms"].some((p) => urlPath.includes(p))) {
      priority = 0.5; // Legal pages lower priority
      changefreq = "yearly";
    }

    // Build sitemap entry
    const entry = {
      loc: urlPath,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };

    // For blog posts, try to get lastmod from frontmatter
    if (urlPath.startsWith("/blog/") && urlPath.length > "/blog/".length) {
      const slug = urlPath.split("/blog/")[1];
      try {
        const blogDir = path.join(
          process.cwd(),
          "contents/blog/subscription-tracking",
        );
        const filePath = path.join(blogDir, `${slug}.mdx`);
        const content = fs.readFileSync(filePath, "utf8");
        const { data } = matter(content);
        if (data.date) {
          entry.lastmod = new Date(data.date).toISOString();
        }
      } catch (e) {
        // Silently skip if file not found
      }
    }

    return entry;
  },
};
