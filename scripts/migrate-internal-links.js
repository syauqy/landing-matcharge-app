#!/usr/bin/env node

/**
 * Migration script: inject internal links into blog posts
 *
 * Usage:
 *   node scripts/migrate-internal-links.js         # Apply changes
 *   node scripts/migrate-internal-links.js --dry   # Dry-run mode
 *
 * This script:
 * 1. Reads all MDX files in contents/blog/subscription-tracking/
 * 2. Injects pillar page link if not already present
 * 3. Injects 2 random sibling links if not already present
 * 4. Preserves original formatting and handles idempotency
 */

const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(process.cwd(), "contents/blog/subscription-tracking");
const PILLAR_SLUG = "subscription-tracking-guide";
const DRY_RUN = process.argv.includes("--dry");

// ============================================================================
// Utilities
// ============================================================================

/**
 * Parse frontmatter from MDX content
 * Returns { frontmatter: object, content: string }
 */
function parseMDX(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, content };
  }

  const frontmatterStr = match[1];
  const bodyContent = match[2];

  const frontmatter = {};
  frontmatterStr.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      const value = valueParts.join(":").trim().replace(/^["']|["']$/g, "");
      frontmatter[key.trim()] = value;
    }
  });

  return { frontmatter, content: bodyContent };
}

/**
 * Rebuild MDX with updated frontmatter and content
 */
function rebuildMDX(frontmatter, content) {
  const lines = [];
  lines.push("---");
  Object.entries(frontmatter).forEach(([key, value]) => {
    lines.push(`${key}: ${value}`);
  });
  lines.push("---");
  lines.push("");
  lines.push(content);
  return lines.join("\n");
}

/**
 * Check if content already contains a link
 */
function containsLink(content, slug) {
  return new RegExp(`/blog/${slug}`, "i").test(content);
}

/**
 * Select N random items from array, excluding specified slugs
 */
function selectRandom(items, count, excludeSlugs) {
  const filtered = items.filter((item) => !excludeSlugs.includes(item.slug));
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Inject pillar link after first paragraph
 */
function injectPillarLink(content) {
  // Find the first paragraph (non-heading, non-empty)
  const paragraphs = content.split("\n\n").filter((p) => p.trim() && !p.trim().startsWith("#"));

  if (paragraphs.length === 0) {
    return content;
  }

  const firstPara = paragraphs[0];
  const pillarText = `

For a comprehensive overview, see our [complete subscription tracking guide](/blog/${PILLAR_SLUG}).`;

  return content.replace(firstPara, firstPara + pillarText);
}

/**
 * Inject sibling links section before CTA block or at end
 */
function injectSiblingLinks(content, siblings) {
  const siblingLinksSection = `

## You may also find these guides helpful

${siblings.map((s) => `- [${s.title}](/blog/${s.slug})`).join("\n")}
`;

  // Try to inject before CTA block if it exists
  const ctaMatch = content.match(/\n## Take Control of Your Subscriptions/);
  if (ctaMatch) {
    return content.replace(/\n## Take Control of Your Subscriptions/, siblingLinksSection + "\n\n## Take Control of Your Subscriptions");
  }

  // Otherwise, inject before FAQ if exists
  const faqMatch = content.match(/\n## Frequently Asked Questions/);
  if (faqMatch) {
    return content.replace(/\n## Frequently Asked Questions/, siblingLinksSection + "\n\n## Frequently Asked Questions");
  }

  // Default: append before any final CTA or at the end
  return content.trimEnd() + siblingLinksSection;
}

/**
 * Check if sibling links section already exists
 */
function hasSiblingSection(content) {
  return /## You may also find these guides helpful/i.test(content);
}

// ============================================================================
// Main logic
// ============================================================================

function main() {
  console.log(`\n📖 Blog Internal Links Migration`);
  console.log(`📁 Directory: ${BLOG_DIR}`);
  if (DRY_RUN) console.log(`🔍 DRY RUN MODE - no files will be modified\n`);
  else console.log(`✏️  APPLY MODE - files will be modified\n`);

  // Read all MDX files
  let files;
  try {
    files = fs
      .readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, ""));
  } catch (err) {
    console.error(`❌ Error reading directory: ${err.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log(`⚠️  No MDX files found in ${BLOG_DIR}`);
    process.exit(0);
  }

  // Parse all posts to extract metadata
  const posts = [];
  files.forEach((slug) => {
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { frontmatter, content } = parseMDX(raw);
    posts.push({
      slug,
      title: frontmatter.title || slug,
      filePath,
      raw,
      frontmatter,
      content,
    });
  });

  console.log(`Found ${posts.length} posts\n`);

  // Process each post
  let updated = 0;
  let skipped = 0;

  posts.forEach((post) => {
    // Skip pillar page itself
    if (post.slug === PILLAR_SLUG) {
      console.log(`⏭️  Skipping: ${post.slug} (pillar page)`);
      return;
    }

    let modified = false;
    let newContent = post.content;

    // Step 1: Inject pillar link if missing
    if (!containsLink(newContent, PILLAR_SLUG)) {
      console.log(`  ✓ Adding pillar link: ${post.slug}`);
      newContent = injectPillarLink(newContent);
      modified = true;
    }

    // Step 2: Inject sibling links if missing
    if (!hasSiblingSection(newContent)) {
      const siblings = selectRandom(posts, 2, [post.slug, PILLAR_SLUG]);

      if (siblings.length > 0) {
        console.log(`  ✓ Adding ${siblings.length} sibling links: ${post.slug}`);
        newContent = injectSiblingLinks(newContent, siblings);
        modified = true;
      }
    }

    if (modified) {
      if (!DRY_RUN) {
        const updated_mdx = rebuildMDX(post.frontmatter, newContent);
        fs.writeFileSync(post.filePath, updated_mdx, "utf-8");
      }
      console.log(`📝 Updated: ${post.slug}`);
      updated++;
    } else {
      console.log(`⏭️  Skipped: ${post.slug} (already up to date)`);
      skipped++;
    }
  });

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 Summary`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  if (DRY_RUN) {
    console.log(`ℹ️  DRY RUN - no files were actually written`);
  } else {
    console.log(`✅ Changes applied`);
  }
  console.log(`${"=".repeat(60)}\n`);
}

main();
