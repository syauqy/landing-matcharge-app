#!/usr/bin/env node

/**
 * BIDIRECTIONAL LINK SYNCHRONIZER SCRIPT
 *
 * PURPOSE: After a new article is generated, inject links into existing articles
 * This ensures that when Article B is created, it gets links FROM Articles A and C
 * (preventing orphan articles).
 *
 * USAGE:
 *   node scripts/sync-bidirectional-links.js
 *
 * BEST PRACTICES:
 *   1. Run this AFTER new articles are committed via generate.js
 *   2. Can be integrated into GitHub Actions workflows
 *   3. Or run manually: npm run sync-links
 *   4. Also useful to audit existing links: npm run audit-links
 *
 * FLAGS:
 *   --dry-run   : Preview changes without writing
 *   --verbose   : Show detailed output
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const {
  computeTitleSimilarity,
  findLinkingCandidates,
  injectLinkIntoExisting,
} = require("../lib/link-sync");

const CLUSTER_DIR = path.join(
  process.cwd(),
  "contents/blog/subscription-tracking",
);
const VERBOSE = process.argv.includes("--verbose");
const DRY_RUN = process.argv.includes("--dry-run");

if (DRY_RUN) {
  console.log("🔍 DRY RUN MODE - No files will be modified\n");
}

/**
 * Get all blog articles with metadata
 */
function getArticles() {
  const articles = [];
  const files = fs.readdirSync(CLUSTER_DIR).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const filePath = path.join(CLUSTER_DIR, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);

    if (data.slug) {
      articles.push({
        slug: data.slug,
        title: data.title || file.replace(/\.mdx$/, ""),
        file,
        filePath,
      });
    }
  }

  return articles;
}

/**
 * Get modification times of articles (to find newly created ones)
 */
function getRecentArticles(articles, hoursBack = 24) {
  const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000;

  const recent = [];

  for (const article of articles) {
    const stats = fs.statSync(article.filePath);
    if (stats.mtimeMs > cutoffTime) {
      recent.push({
        ...article,
        modTime: new Date(stats.mtimeMs),
      });
    }
  }

  return recent.sort((a, b) => b.modTime - a.modTime);
}

/**
 * Sync links for a newly created article
 */
function syncArticleLinks(newArticle, existingArticles) {
  const results = {
    injected: 0,
    skipped: 0,
    errors: 0,
  };

  // Find topically similar articles
  const candidates = findLinkingCandidates(
    newArticle.slug,
    newArticle.title,
    existingArticles,
    5, // Look at top 5 candidates
  );

  if (candidates.length === 0) {
    if (VERBOSE) {
      console.log(`  ⚠️  No suitable linking candidates found`);
    }
    return results;
  }

  // Inject into top 2 candidates
  const targetCount = Math.min(2, candidates.length);

  for (let i = 0; i < targetCount; i++) {
    const candidate = candidates[i];

    try {
      // Read existing article
      const raw = fs.readFileSync(candidate.filePath, "utf8");
      const parsed = matter(raw);

      // Try to inject
      const newContent = injectLinkIntoExisting(
        parsed.content,
        newArticle.slug,
        newArticle.title,
      );

      if (!newContent) {
        results.skipped++;
        if (VERBOSE) {
          console.log(
            `  ⊘ ${candidate.slug} - already linked or no injection point`,
          );
        }
        continue;
      }

      // Write back (unless dry-run)
      if (!DRY_RUN) {
        const updated = matter.stringify(newContent, parsed.data);
        fs.writeFileSync(candidate.filePath, updated);
      }

      results.injected++;
      console.log(
        `  ✓ Injected link in "${candidate.slug}"${DRY_RUN ? " (DRY RUN)" : ""}`,
      );
    } catch (err) {
      results.errors++;
      console.error(
        `  ✗ Error injecting link in "${candidate.slug}": ${err.message}`,
      );
    }
  }

  return results;
}

/**
 * Main function
 */
async function main() {
  console.log("📨 BIDIRECTIONAL LINK SYNCHRONIZER\n");
  console.log("═".repeat(60));

  try {
    // Get all articles
    const articles = getArticles();

    if (articles.length === 0) {
      console.log("❌ No articles found in cluster directory");
      process.exit(1);
    }

    console.log(`\n📚 Loaded ${articles.length} articles\n`);

    // Find recently created articles (last 24 hours)
    const recentArticles = getRecentArticles(articles, 24);

    if (recentArticles.length === 0) {
      console.log("ℹ️  No recently created articles found (within 24 hours)");
      console.log(
        "   Use --verbose to see last modified dates for all articles",
      );

      if (VERBOSE) {
        console.log("\nLast 5 articles by modification time:");
        getRecentArticles(articles, 1000)
          .slice(0, 5)
          .forEach((a) => {
            console.log(`  • ${a.slug}`);
            console.log(`    Modified: ${a.modTime.toLocaleString()}`);
          });
      }

      console.log("═".repeat(60));
      process.exit(0);
    }

    console.log(
      `🔍 Found ${recentArticles.length} recently modified article(s)\n`,
    );

    let totalInjected = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each recent article
    for (const recentArticle of recentArticles) {
      console.log(`Processing: ${recentArticle.slug}`);
      console.log(`  "${recentArticle.title}"`);
      console.log(`  Modified: ${recentArticle.modTime.toLocaleString()}`);

      // Get other articles for linking (exclude the current one)
      const otherArticles = articles.filter(
        (a) => a.slug !== recentArticle.slug,
      );

      // Sync links
      const result = syncArticleLinks(recentArticle, otherArticles);

      console.log(
        `  Summary: ${result.injected} injected, ${result.skipped} skipped, ${result.errors} errors\n`,
      );

      totalInjected += result.injected;
      totalSkipped += result.skipped;
      totalErrors += result.errors;
    }

    console.log("═".repeat(60));
    console.log(`\n✅ SYNC COMPLETE`);
    console.log(`   Injected: ${totalInjected} links`);
    console.log(`   Skipped: ${totalSkipped}`);
    console.log(`   Errors: ${totalErrors}\n`);

    if (DRY_RUN) {
      console.log("💡 This was a DRY RUN. Pass --dry-run to modify files.\n");
    }
  } catch (err) {
    console.error("❌ SYNC FAILED:", err);
    process.exit(1);
  }
}

// Run
main();
