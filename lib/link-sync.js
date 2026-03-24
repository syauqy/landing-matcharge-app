/**
 * BIDIRECTIONAL LINK INJECTOR
 *
 * PURPOSE: Inject links into EXISTING articles when a NEW article is created
 * This solves the "orphan article" problem by ensuring new articles get linked FROM
 * existing articles, not just TO them.
 *
 * USAGE (called from pages/api/generate.js):
 *   import { attemptBidirectionalLinking } from '@/lib/link-sync';
 *   await attemptBidirectionalLinking(newSlug, newTitle);
 *
 * STRATEGY:
 *   1. Find 2-3 topically similar articles from existing cluster
 *   2. Inject a link to the new article in each of them
 *   3. Use same injection pattern as injectInternalLinks() for consistency
 *   4. Dedup to avoid duplicate links
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CLUSTER_DIR = "contents/blog/subscription-tracking";

/**
 * Compute semantic similarity between titles (simple Jaccard index)
 */
function computeTitleSimilarity(title1, title2) {
  const normalize = (t) =>
    t
      .toLowerCase()
      .replace(/how to|tracking|using|on iphone|for |with |a |an /gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

  const terms1 = normalize(title1);
  const terms2 = normalize(title2);

  const set1 = new Set(terms1);
  const set2 = new Set(terms2);

  const intersection = [...set1].filter((t) => set2.has(t)).length;
  const union = new Set([...set1, ...set2]).size;

  return union === 0 ? 0 : intersection / union;
}

/**
 * Find existing articles that would benefit from linking to the new article
 * Returns array of {slug, title, similarity, filePath}
 */
function findLinkingCandidates(newSlug, newTitle, existingArticles, topN = 5) {
  const candidates = [];

  for (const article of existingArticles) {
    if (article.slug === newSlug) continue;

    const similarity = computeTitleSimilarity(newTitle, article.title);

    if (similarity > 0.1) {
      // threshold to avoid completely irrelevant articles
      candidates.push({
        slug: article.slug,
        title: article.title,
        similarity,
        filePath: article.filePath,
      });
    }
  }

  // Sort by similarity (desc) and pick top N
  candidates.sort((a, b) => b.similarity - a.similarity);
  return candidates.slice(0, topN);
}

/**
 * Inject link to new article in an existing article's content
 * Uses same location strategy as injectInternalLinks() for consistency
 */
function injectLinkIntoExisting(content, newSlug, newTitle) {
  // Avoid duplicate injection
  if (content.includes(`/blog/${newSlug}`)) {
    return null; // Already linked
  }

  // Find paragraph breaks
  const paraBreaks = [];
  let idx = 0;
  while ((idx = content.indexOf("\n\n", idx)) !== -1) {
    paraBreaks.push(idx);
    idx += 2;
  }

  if (paraBreaks.length === 0) {
    return null; // Can't inject if no paragraphs
  }

  // Inject after a random mid-to-late paragraph (not too early or too late)
  const targetIndex =
    Math.floor(paraBreaks.length * 0.5) + Math.floor(Math.random() * 3);
  const insertAt = paraBreaks[targetIndex] ?? paraBreaks[paraBreaks.length - 1];

  const linkSentence = ` You may also find it useful to read about [${newTitle}](/blog/${newSlug}).`;

  const modified =
    content.slice(0, insertAt) + linkSentence + content.slice(insertAt);

  return modified;
}

/**
 * Main function: Inject bidirectional links for a newly created article
 *
 * @param {string} newSlug - Slug of the newly created article
 * @param {string} newTitle - Title of the newly created article
 * @param {Array} existingArticles - Array of {slug, title, filePath} for existing articles
 * @returns {Object} Results: {injected: [], failed: [], skipped: []}
 */
function attemptBidirectionalLinking(newSlug, newTitle, existingArticles) {
  const results = {
    injected: [],
    failed: [],
    skipped: [],
  };

  // Find topically similar articles
  const candidates = findLinkingCandidates(newSlug, newTitle, existingArticles);

  if (candidates.length === 0) {
    console.log(`[Link Sync] No suitable candidates found for ${newSlug}`);
    return results;
  }

  // Inject into top 2-3 candidates
  const targetCount = Math.min(2, candidates.length);

  for (let i = 0; i < targetCount; i++) {
    const candidate = candidates[i];

    try {
      // Read existing article
      const filePath = path.join(process.cwd(), candidate.filePath);
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = matter(raw);

      // Inject link
      const newContent = injectLinkIntoExisting(
        parsed.content,
        newSlug,
        newTitle,
      );

      if (!newContent) {
        results.skipped.push({
          slug: candidate.slug,
          reason: "Already linked or no injection point found",
        });
        continue;
      }

      // Write back
      const updated = matter.stringify(newContent, parsed.data);
      fs.writeFileSync(filePath, updated);

      results.injected.push({
        slug: candidate.slug,
        title: candidate.title,
      });

      console.log(`[Link Sync] ✓ Injected link in "${candidate.slug}"`);
    } catch (err) {
      results.failed.push({
        slug: candidate.slug,
        error: err.message,
      });
      console.error(
        `[Link Sync] ✗ Failed to inject in "${candidate.slug}":`,
        err.message,
      );
    }
  }

  return results;
}

module.exports = {
  computeTitleSimilarity,
  findLinkingCandidates,
  injectLinkIntoExisting,
  attemptBidirectionalLinking,
};
