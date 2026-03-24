# Internal Linking System - Best Practices & Architecture

## Overview

This document describes the **bidirectional internal linking system** used to maintain a healthy blog network and prevent orphan articles (pages with no incoming links).

**Problem it solves:** When new articles are auto-generated, they outbound links (A → B) but receive no incoming links, creating orphan pages that are unreachable from other content.

**Solution:** Bidirectional linking ensures new articles get linked FROM existing related articles automatically.

---

## System Architecture

### 1. Link Injection During Article Creation

**File:** `lib/blog.js` → `injectInternalLinks()`

When a new article is generated via `pages/api/generate.js`:

```javascript
// Input: Raw article body + sibling articles
// Output: Article with injected links

// Result:
// - 1 link to pillar page (/blog/subscription-tracking-guide)
// - 2 links to related sibling articles
```

**Injection points:**

- Pillar link: After 2nd paragraph
- Sibling links: After 3rd and 4th paragraphs
- Format: `You may also find it useful to read about [title](/blog/slug).`

**Deduplication:** Checks for existing links with `/blog/{slug}` pattern

---

### 2. Bidirectional Link Injection (NEW)

**File:** `lib/link-sync.js` → `attemptBidirectionalLinking()`

After a new article is committed, this module:

1. **Finds similar articles** using title similarity (Jaccard index)
2. **Selects top 2-3 candidates** by relevance
3. **Injects a link** to the new article in each candidate
4. **Deduplicates** to avoid duplicate links

**Trigger:** Must be run manually or via CI/CD after `generate.js` completes

---

## Workflow

### Current Workflow (One-Way)

```
[generate.js]
    ↓
[buildMDX] - injects links FROM new article TO existing
    ↓
[commitFile] - save article
    ↓
⚠️ NEW ARTICLE IS ORPHAN (no incoming links)
```

### Desired Workflow (Bidirectional - FIXED)

```
[generate.js]
    ↓
[buildMDX] - injects outbound links (A → B)
    ↓
[commitFile] - save article
    ↓
[sync-bidirectional-links.js] - injects inbound links (C → B)
    ↓
✅ NEW ARTICLE IS DISCOVERED (has incoming links)
```

---

## Usage Guide

### Automatic Workflow (Recommended)

**Step 1: Generate new article**

```bash
# This runs daily via GitHub Actions or manual trigger
curl -X POST https://your-site.com/api/generate \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Step 2: Sync bidirectional links**

```bash
# Option A: Run locally after generation
npm run sync-links

# Option B: Integrate into GitHub Actions
# See section "CI/CD Integration" below
```

---

### Manual/Dev Workflow

**1. Audit existing links**

```bash
npm run audit-links          # Show all issues
npm run audit-links -- --fix # Show suggested fixes
npm run audit-links -- --verbose # Detailed per-article analysis
```

**2. Sync links (dry-run)**

```bash
node scripts/sync-bidirectional-links.js --dry-run --verbose
```

**3. Sync links (apply)**

```bash
npm run sync-links
```

---

## Scripts Reference

### `scripts/audit-bidirectional-links.js`

Analyzes the entire link structure and reports issues.

**Output:**

- 🔴 **Orphan articles** (no incoming links)
- 🔗 **One-way links** (A→B exists, but B→A missing)
- 📊 **Link density** (articles with insufficient internal links)

\*\*Suggested fixesfor orphans and one-way links

**Usage:**

```bash
# Show all issues
node scripts/audit-bidirectional-links.js

# Show suggested fixes
node scripts/audit-bidirectional-links.js --fix

# With verbose details
node scripts/audit-bidirectional-links.js --fix --verbose
```

---

### `scripts/sync-bidirectional-links.js`

Injects links into existing articles when new ones are created.

**What it does:**

1. Detects recently modified articles (last 24 hours)
2. For each new article:
   - Finds 2-3 topically similar existing articles
   - Injects a link to the new article in each
3. Reports results

**Usage:**

```bash
# Dry-run (preview changes)
npm run sync-links -- --dry-run --verbose

# Apply changes
npm run sync-links

# Apply changes with detailed output
npm run sync-links -- --verbose
```

---

## Library Reference

### `lib/link-sync.js`

Core module for bidirectional linking operations.

**Exported functions:**

#### `computeTitleSimilarity(title1, title2) → number`

Computes semantic similarity between titles (0-1).

```javascript
computeTitleSimilarity(
  "How to Track Non-Apple Subscriptions",
  "Tracking External Subscriptions on iPhone",
); // → 0.3 (some overlap)
```

#### `findLinkingCandidates(newSlug, newTitle, existingArticles, topN=5) → array`

Finds topically similar articles to link to.

```javascript
const candidates = findLinkingCandidates(
  "how-to-track-non-apple-subscriptions-using-iphone-notes-app",
  "How To Track Non-Apple Subscriptions Using iPhone Notes App",
  existingArticles,
  3,
);
// Returns: [{slug, title, similarity, filePath}, ...]
```

#### `injectLinkIntoExisting(content, newSlug, newTitle) → string|null`

Injects a link into existing article content.

- Returns modified content if successful
- Returns null if already linked or no injection point

```javascript
const updated = injectLinkIntoExisting(
  articleBody,
  "how-to-track-non-apple",
  "How To Track Non-Apple Subscriptions",
);
```

#### `attemptBidirectionalLinking(newSlug, newTitle, existingArticles) → object`

Main function: orchestrates full bidirectional linking process.

---

## Implementation Details

### Link Similarity Algorithm

**Purpose:** Match new articles to similar existing ones for cross-linking.

**Algorithm:**

1. Normalize titles (remove common words like "how to", "tracking", "on iPhone")
2. Split into terms (only terms > 3 chars)
3. Calculate Jaccard similarity
4. Filter by threshold (>0.1)
5. Sort by similarity (descending)

**Example:**

```
Title 1: "How To Track Non-Apple Subscriptions Using iPhone Notes App"
Title 2: "Best Way To Monitor Streaming Service Costs On iPhone Apps"

Terms 1: [track, non-apple, subscriptions, using, iphone, notes]
Terms 2: [best, monitor, streaming, service, costs, iphone, apps]

Intersection: [iphone] = 1
Union: 12 unique terms
Similarity: 1/12 = 0.083 (below threshold, won't link)
```

### Link Injection Pattern

**Strategy:** Insert links at natural paragraph breaks, not too early or late.

**Algorithm:**

1. Find all double-newline positions (`\n\n`)
2. Calculate target position at ≈50% of paragraphs + some randomness
3. Inject natural-language link sentence at that point
4. Dedup: skip if link already exists

**Example:**

```markdown
# Original

First paragraph about subscriptions.

Second paragraph diving deeper.

Third paragraph...

# After injection

First paragraph about subscriptions.

Second paragraph diving deeper. You may also find it useful to read about [How to Track Carrier-Billed Subscriptions](/blog/how-to-track-carrier-billed-subscriptions).

Third paragraph...
```

---

## Best Practices

### For Content Authors

1. **Manual Article Creation:** When creating articles manually, manually add cross-links to similar articles
2. **Periodic Audits:** Run `npm run audit-links` quarterly to catch orphaned or one-way linked articles
3. **Link Density:** Aim for 2-3 sibling links + 1 pillar link per article minimum

### For Automation/Generation

1. **Always run sync after generation:**

   ```bash
   # In CI/CD or cron script
   node pages/api/generate.js
   node scripts/sync-bidirectional-links.js
   ```

2. **Monitor for issues:**

   ```bash
   node scripts/audit-bidirectional-links.js --fix
   ```

3. **Prevent one-way links:**
   - Periodically sync even for old articles
   - Consider running sync weekly even without new articles

### SEO Benefits

✅ **Improves discoverability** - Internal links help search engines understand site structure
✅ **Distributes page rank** - Links pass authority throughout the blog
✅ **Reduces bounce rate** - Users find related content easily
✅ **Increases time on site** - More connected content keeps users engaged
✅ **Prevents orphaned content** - No dead-end articles

---

## Troubleshooting

### Issue: "Orphan Articles" detected

**Cause:** New articles created without bidirectional link sync

**Solution:**

```bash
# 1. Audit to see which are orphan
npm run audit-links

# 2. Run sync for recent articles
npm run sync-links

# 3. Verify fixed
npm run audit-links
```

### Issue: One-way links (A→B but not B→A)

**Cause:** Manual links created without reciprocal links, or sync didn't update existing article

**Solution:**

```bash
# Run sync to auto-link missing reciprocals
npm run sync-links -- --verbose

# Or manually add reciprocal link in the target article
# (edit article and add: "You may also find it useful to read about [A](/blog/slug-a)")
```

### Issue: Articles linked to irrelevant content

**Cause:** Title similarity algorithm found low-quality matches

**Solution:**

- Manually remove bad links (search for link in article, delete)
- Increase similarity threshold in `lib/link-sync.js` (change `0.1` to higher value)
- Run link sync only for high-confidence matches (`topN=2` instead of 5)

---

## Future Improvements

1. **Content-based similarity** (not just title)
   - Analyze article body keywords
   - Use TF-IDF or embedding models

2. **Link cycle detection**
   - Ensure A→B→C links form logical flow
   - Avoid circular linking

3. **Link aging**
   - Periodically refresh old articles with new cross-links
   - Prevent stale link networks

4. **Analytics tracking**
   - Count internal link clicks
   - Optimize link placement based on CTR

5. **Automatic categorization**

- Use NLP to assign categories automatically
- Use categories for more precise linking

---

## Package.json Scripts

Add these to your `package.json` scripts:

```json
{
  "scripts": {
    "audit-links": "node scripts/audit-bidirectional-links.js",
    "sync-links": "node scripts/sync-bidirectional-links.js",
    "sync-links:dry": "node scripts/sync-bidirectional-links.js --dry-run --verbose"
  }
}
```

---

## Implementation Checklist

- [x] Create `lib/link-sync.js` - core bidirectional linking module
- [x] Create `scripts/audit-bidirectional-links.js` - link structure analyzer
- [x] Create `scripts/sync-bidirectional-links.js` - post-generation sync script
- [x] Update `pages/api/generate.js` - add logging for sync reminder
- [x] Fix orphan articles by adding manual links
- [x] Add npm scripts to `package.json`
- [ ] Integrate sync into GitHub Actions workflow
- [ ] Add monthly audit task to team process
- [ ] Monitor for new orphans monthly

---

## Questions?

**Q: Why not auto-sync during article generation?**
A: Next.js API routes have limitations with file I/O during async GitHub operations. Post-generation sync is safer and more reliable.

**Q: Can I adjust link similarity threshold?**
A: Yes! Edit `lib/link-sync.js` line where `if (similarity > 0.1)` and change `0.1` to desired threshold.

**Q: How often should I run audits?**
A: Monthly audits + automatic sync after each new article generation. Quarterly comprehensive review.

**Q: Does this affect SEO?**
A: Positively! Internal linking improves crawlability, distributes page rank, and helps users discover related content.
