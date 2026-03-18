#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const BLOG_DIR = path.join(__dirname, "../contents/blog/subscription-tracking");

// Get all blog files
const getAllBlogFiles = () => {
  const files = fs.readdirSync(BLOG_DIR);
  return files.filter((file) => file.endsWith(".mdx"));
};

// Extract frontmatter and content
const parseBlogFile = (filename) => {
  const filepath = path.join(BLOG_DIR, filename);
  const content = fs.readFileSync(filepath, "utf-8");
  const { data, content: body } = matter(content);
  return {
    filename,
    slug: data.slug,
    title: data.title,
    content: body,
    fullPath: `/blog/${data.slug}`,
  };
};

// Find all internal blog links in content
const findInternalLinks = (content) => {
  const linkRegex = /\[([^\]]+)\]\(\/blog\/([^/)]+)\)/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      slug: match[2],
    });
  }

  return links;
};

// Main analysis
const analyzeOrphanLinks = () => {
  const files = getAllBlogFiles();
  const blogPosts = {};
  const incomingLinks = {};

  // Parse all files
  files.forEach((file) => {
    const post = parseBlogFile(file);
    blogPosts[post.slug] = post;
    incomingLinks[post.slug] = [];
  });

  // Find all links
  Object.values(blogPosts).forEach((post) => {
    const links = findInternalLinks(post.content);
    links.forEach((link) => {
      if (incomingLinks[link.slug]) {
        incomingLinks[link.slug].push({
          fromSlug: post.slug,
          fromTitle: post.title,
          linkText: link.text,
        });
      }
    });
  });

  // Identify orphans
  const orphans = [];
  const wellLinked = [];

  Object.entries(incomingLinks).forEach(([slug, incoming]) => {
    const post = blogPosts[slug];
    if (incoming.length === 0 && slug !== "subscription-tracking-guide") {
      orphans.push({
        slug,
        title: post.title,
        filepath: post.filename,
      });
    } else if (incoming.length > 0) {
      wellLinked.push({ slug, count: incoming.length, title: post.title });
    }
  });

  return {
    totalPosts: files.length,
    orphans: orphans.sort((a, b) => a.title.localeCompare(b.title)),
    wellLinked: wellLinked.sort((a, b) => b.count - a.count),
    incomingLinks: incomingLinks,
    blogPosts: blogPosts,
  };
};

const results = analyzeOrphanLinks();

console.log("\n=== ORPHAN LINKS ANALYSIS ===\n");
console.log(`Total blog posts: ${results.totalPosts}`);
console.log(`Orphan pages (no incoming links): ${results.orphans.length}\n`);

console.log("ORPHAN PAGES:");
results.orphans.forEach((orphan, i) => {
  console.log(`${i + 1}. ${orphan.title}`);
  console.log(`   Slug: ${orphan.slug}`);
  console.log(`   File: ${orphan.filepath}\n`);
});

console.log("\nWELL-LINKED PAGES (good candidates for adding links):");
results.wellLinked.forEach((post, i) => {
  if (i < 8) {
    console.log(`${i + 1}. ${post.title} (${post.count} incoming links)`);
  }
});

// Export for use in linking script
module.exports = results;
