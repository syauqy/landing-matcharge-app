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
 * Get related posts based on tags/categories
 */
export function getRelatedPosts(currentSlug, limit = 3) {
  const allPosts = getAllBlogPosts();
  const currentPost = allPosts.find((post) => post.slug === currentSlug);

  if (!currentPost) return [];

  const related = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const tagMatches =
        post.tags?.filter((tag) => currentPost.tags?.includes(tag)).length || 0;
      const categoryMatches =
        post.categories?.filter((cat) => currentPost.categories?.includes(cat))
          .length || 0;

      return {
        ...post,
        relevance: tagMatches + categoryMatches * 2,
      };
    })
    .filter((post) => post.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
    .map(({ relevance, ...post }) => post);

  return related;
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
      ${post.tags?.join(" ")} 
      ${post.categories?.join(" ")}
    `.toLowerCase();

    return searchableText.includes(lowerQuery);
  });
}
