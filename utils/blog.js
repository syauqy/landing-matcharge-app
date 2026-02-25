import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "contents/blog");

/**
 * Serialize post data for JSON serialization
 */
function serializePost(post) {
  return {
    ...post,
    date:
      typeof post.date === "string"
        ? post.date
        : new Date(post.date).toISOString(),
  };
}

/**
 * Get all blog post files recursively from subdirectories
 */
export function getBlogFiles() {
  const files = [];

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively walk subdirectories
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        // Store relative path from BLOG_DIR
        const relativePath = path.relative(BLOG_DIR, fullPath);
        files.push(relativePath);
      }
    }
  }

  walkDir(BLOG_DIR);
  return files;
}

/**
 * Get all blog posts with metadata
 */
export function getAllBlogPosts() {
  const files = getBlogFiles();

  const posts = files
    .map((fileName) => {
      const filePath = path.join(BLOG_DIR, fileName);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        ...data,
        slug: data.slug || fileName.replace(".mdx", ""),
        content,
        // Normalize tags and categories to always be arrays
        tags: Array.isArray(data.tags) ? data.tags : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        readingTime: data.readingTime || calculateReadingTime(content),
        date:
          typeof data.date === "string"
            ? data.date
            : new Date(data.date).toISOString(),
      };
    })
    .filter((post) => post.status === "published")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return posts;
}

/**
 * Get a single blog post by slug
 */
export function getBlogPostBySlug(slug) {
  const files = getBlogFiles();

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    // Match by slug from frontmatter
    if ((data.slug || file.replace(".mdx", "")) === slug) {
      return {
        ...data,
        slug: data.slug || file.replace(".mdx", ""),
        content,
        // Normalize tags and categories to always be arrays
        tags: Array.isArray(data.tags) ? data.tags : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        readingTime: data.readingTime || calculateReadingTime(content),
        date:
          typeof data.date === "string"
            ? data.date
            : new Date(data.date).toISOString(),
      };
    }
  }

  return null;
}

/**
 * Get blog post slugs for static generation
 */
export function getBlogPostSlugs() {
  return getAllBlogPosts().map((post) => ({
    params: { slug: post.slug },
  }));
}

/**
 * Get related posts — cluster-aware, sorted newest first.
 * Picks from the same category cluster as the current post.
 * If more than 6 candidates exist, randomizes among the top 6 to keep suggestions fresh.
 */
export function getRelatedPosts(currentSlug, limit = 3) {
  const allPosts = getAllBlogPosts(); // already sorted newest-first
  const currentPost = allPosts.find((post) => post.slug === currentSlug);

  if (!currentPost) return [];

  // Get cluster from categories array (handle both array and string cases)
  const cluster = Array.isArray(currentPost.categories)
    ? currentPost.categories[0]
    : null;
  if (!cluster) return []; // No cluster, can't find related posts

  // Filter to same cluster, excluding current post
  let candidates = allPosts.filter(
    (post) =>
      post.slug !== currentSlug &&
      Array.isArray(post.categories) &&
      post.categories.includes(cluster),
  );

  // If >6, randomize among the top 6 (newest) to keep the widget dynamic
  if (candidates.length > 6) {
    const top6 = candidates.slice(0, 6);
    for (let i = top6.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top6[i], top6[j]] = [top6[j], top6[i]];
    }
    candidates = top6;
  }

  return candidates.slice(0, limit);
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get paginated blog posts
 */
export function getPaginatedPosts(page = 1, postsPerPage = 6) {
  const allPosts = getAllBlogPosts();
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    currentPage: page,
    totalPages,
    totalPosts: allPosts.length,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Search blog posts by query
 */
export function searchBlogPosts(query) {
  const allPosts = getAllBlogPosts();
  const lowerQuery = query.toLowerCase();

  return allPosts.filter((post) => {
    const searchableText = `
      ${post.title} 
      ${post.description} 
      ${Array.isArray(post.tags) ? post.tags.join(" ") : ""} 
      ${Array.isArray(post.categories) ? post.categories.join(" ") : ""}
    `.toLowerCase();

    return searchableText.includes(lowerQuery);
  });
}
