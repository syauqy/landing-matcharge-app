/** @type {import('next-sitemap').IConfig} */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

module.exports = {
  siteUrl: process.env.SITE_URL || "https://matcharge.app",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
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
    } else if (urlPath.startsWith("/blog/")) {
      priority = 0.85; // Individual blog posts
      changefreq = "monthly";
    } else if (["privacy", "terms"].some(p => urlPath.includes(p))) {
      priority = 0.5; // Legal pages lower priority
      changefreq = "yearly";
    }

    const entry = {
      loc: urlPath,
      changefreq: changefreq,
      priority: priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };

    // Custom transformation for blog posts to get lastmod from frontmatter
    if (urlPath.startsWith("/blog/") && urlPath.length > "/blog/".length) {
      const slug = urlPath.split("/blog/")[1];
      try {
        const blogDir = path.join(process.cwd(), "public/content/blog");
        const filePath = path.join(blogDir, `${slug}.md`);
        const content = fs.readFileSync(filePath, "utf8");
        const { data } = matter(content);
        if (data.date) {
          entry.lastmod = new Date(data.date).toISOString();
        }
      } catch (e) {
        console.warn(`Could not read frontmatter for ${urlPath} to get date.`);
      }
    }

    return entry;
  },
};
