/**
 * BIDIRECTIONAL LINK AUDIT SCRIPT
 * 
 * PURPOSE: Identify and report orphaned blog posts and bidirectional linking gaps
 * This script detects:
 * 1. Orphan pages (no incoming links)
 * 2. One-way links (A links to B, but B doesn't link back)
 * 3. Link density issues (articles without enough internal links)
 * 
 * USAGE:
 *   node scripts/audit-bidirectional-links.js [--fix] [--verbose]
 * 
 * FLAGS:
 *   --fix      : Suggest fixes (don't auto-apply)
 *   --verbose  : Show detailed analysis for each article
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CLUSTER_DIR = path.join(process.cwd(), 'contents/blog/subscription-tracking');
const PILLAR_SLUG = 'subscription-tracking-guide';

interface BlogArticle {
  slug: string;
  title: string;
  path: string;
  content: string;
  outgoingLinks: string[];
  incomingLinks: string[];
}

/**
 * Parse all blog articles and extract metadata
 */
function getAllArticles() {
  const articles = new Map();
  
  const files = fs.readdirSync(CLUSTER_DIR).filter(f => f.endsWith('.mdx'));
  
  for (const file of files) {
    const filePath = path.join(CLUSTER_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    
    if (!data.slug) continue;
    
    articles.set(data.slug, {
      slug: data.slug,
      title: data.title || file.replace(/\.mdx$/, ''),
      path: filePath,
      content,
      outgoingLinks: extractLinks(content),
    });
  }
  
  return articles;
}

/**
 * Extract all blog links from article content
 */
function extractLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(\/blog\/([a-z0-9\-]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    if (match[2]) links.push(match[2]);
  }
  
  return [...new Set(links)]; // deduplicate
}

/**
 * Build incoming links map (reverse of outgoing)
 */
function buildIncomingLinksMap(articles) {
  const incomingMap = new Map();
  
  for (const [slug] of articles) {
    incomingMap.set(slug, []);
  }
  
  for (const [slug, article] of articles) {
    for (const outLink of article.outgoingLinks) {
      if (incomingMap.has(outLink)) {
        incomingMap.get(outLink).push(slug);
      }
    }
  }
  
  return incomingMap;
}

/**
 * Identify orphan articles
 */
function findOrphans(articles, incomingMap) {
  const orphans = [];
  
  for (const [slug] of articles) {
    // Exclude pillar page
    if (slug === PILLAR_SLUG) continue;
    
    const incomingLinks = incomingMap.get(slug) || [];
    
    if (incomingLinks.length === 0) {
      orphans.push({
        slug,
        title: articles.get(slug).title,
      });
    }
  }
  
  return orphans;
}

/**
 * Find one-way links (articles missing reciprocal links)
 */
function findOneWayLinks(articles, incomingMap) {
  const oneWayIssues = [];
  
  for (const [slug, article] of articles) {
    for (const outLink of article.outgoingLinks) {
      if (outLink === PILLAR_SLUG) continue; // pillar page doesn't need return links
      
      const incomingLinks = incomingMap.get(outLink) || [];
      
      if (!incomingLinks.includes(slug)) {
        oneWayIssues.push({
          from: slug,
          to: outLink,
          fromTitle: article.title,
          toTitle: articles.get(outLink)?.title || outLink,
          issue: 'A→B exists, but B→A missing',
        });
      }
    }
  }
  
  return oneWayIssues;
}

/**
 * Find articles with insufficient internal links
 */
function findLinkDensityIssues(articles, minLinks = 2) {
  const issues = [];
  
  for (const [slug, article] of articles) {
    if (slug === PILLAR_SLUG) continue;
    
    // Count non-pillar links
    const nonPillarLinks = article.outgoingLinks.filter(l => l !== PILLAR_SLUG).length;
    
    if (nonPillarLinks < minLinks) {
      issues.push({
        slug,
        title: article.title,
        linkCount: article.outgoingLinks.length,
        issue: `Only ${nonPillarLinks} sibling links (expected ≥${minLinks})`,
      });
    }
  }
  
  return issues;
}

/**
 * Suggest reciprocal links for orphans
 */
function suggestReciprocalLinks(orphans, articles) {
  const suggestions = [];
  
  for (const orphan of orphans) {
    const orphanArticle = articles.get(orphan.slug);
    const orphanTopics = extractTopicsFromTitle(orphan.title);
    
    // Find related articles by proximity in topics
    const candidates = [];
    
    for (const [otherSlug, other] of articles) {
      if (otherSlug === orphan.slug || otherSlug === PILLAR_SLUG) continue;
      
      const otherTopics = extractTopicsFromTitle(other.title);
      const similarity = computeSimilarity(orphanTopics, otherTopics);
      
      if (similarity > 0) {
        candidates.push({
          slug: otherSlug,
          title: other.title,
          similarity,
        });
      }
    }
    
    // Sort by similarity and promote top 3 candidates
    candidates.sort((a, b) => b.similarity - a.similarity);
    
    suggestions.push({
      orphan: orphan.slug,
      orphanTitle: orphan.title,
      suggestedLinks: candidates.slice(0, 3),
    });
  }
  
  return suggestions;
}

/**
 * Extract key terms from article title
 */
function extractTopicsFromTitle(title) {
  const terms = title.toLowerCase()
    .replace(/how to |how |tracking |using |on iphone|for |with /gi, '')
    .split(/\s+/)
    .filter(t => t.length > 3);
  
  return terms;
}

/**
 * Compute topic similarity (Jaccard index)
 */
function computeSimilarity(topics1, topics2) {
  const set1 = new Set(topics1);
  const set2 = new Set(topics2);
  
  const intersection = [...set1].filter(t => set2.has(t)).length;
  const union = new Set([...set1, ...set2]).size;
  
  return union === 0 ? 0 : intersection / union;
}

/**
 * Main audit function
 */
function runAudit() {
  console.log('\n📋 BIDIRECTIONAL LINK AUDIT\n');
  console.log('═'.repeat(60));
  
  const articles = getAllArticles();
  const incomingMap = buildIncomingLinksMap(articles);
  
  // Find issues
  const orphans = findOrphans(articles, incomingMap);
  const oneWayLinks = findOneWayLinks(articles, incomingMap);
  const densityIssues = findLinkDensityIssues(articles);
  
  // Report orphans
  console.log(`\n🔴 ORPHAN ARTICLES (${orphans.length} found)\n`);
  if (orphans.length === 0) {
    console.log('✅ No orphans detected!');
  } else {
    orphans.forEach(orphan => {
      console.log(`   • ${orphan.slug}`);
      console.log(`     "${orphan.title}"`);
    });
  }
  
  // Report one-way links
  console.log(`\n🔗 ONE-WAY LINKS (${oneWayLinks.length} found)\n`);
  if (oneWayLinks.length === 0) {
    console.log('✅ All links are reciprocal!');
  } else {
    oneWayLinks.slice(0, 5).forEach(issue => {
      console.log(`   • ${issue.from} → ${issue.to}`);
      console.log(`     "${issue.fromTitle}" → "${issue.toTitle}"`);
      console.log(`     Issue: ${issue.issue}\n`);
    });
    if (oneWayLinks.length > 5) {
      console.log(`   ... and ${oneWayLinks.length - 5} more\n`);
    }
  }
  
  // Report link density issues
  console.log(`\n📊 LINK DENSITY (${densityIssues.length} articles with low density)\n`);
  if (densityIssues.length === 0) {
    console.log('✅ All articles have sufficient links!');
  } else {
    densityIssues.forEach(issue => {
      console.log(`   • ${issue.slug}`);
      console.log(`     "${issue.title}"`);
      console.log(`     ${issue.issue}\n`);
    });
  }
  
  // Provide fixing suggestions for orphans
  if (orphans.length > 0 && process.argv.includes('--fix')) {
    console.log('\n💡 SUGGESTED FIXES\n');
    const suggestions = suggestReciprocalLinks(orphans, articles);
    
    suggestions.forEach(sugg => {
      console.log(`Orphan: ${sugg.orphan}`);
      console.log(`Title: "${sugg.orphanTitle}"`);
      console.log(`Suggested links from:\n`);
      sugg.suggestedLinks.forEach(link => {
        console.log(`   ✓ [${link.title}](/blog/${link.slug})`);
      });
      console.log();
    });
  }
  
  // Summary
  const totalIssues = orphans.length + oneWayLinks.length + densityIssues.length;
  console.log('═'.repeat(60));
  console.log(`\n📈 SUMMARY: ${totalIssues} total issues found\n`);
  
  if (totalIssues === 0) {
    console.log('🎉 Your blog linking structure is healthy!\n');
  } else if (process.argv.includes('--fix')) {
    console.log('💡 Run suggestions above to fix issues\n');
  }
}

// Run audit
runAudit();
