import React from "react";
import BlogCard from "./BlogCard";
import clsx from "clsx";

/**
 * Related Articles Component - shows similar posts
 */
export function RelatedArticles({ posts = [], title = "Related Articles" }) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-base-300">
      <h2 className="text-3xl font-bold mb-8 text-base-content">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

export default RelatedArticles;
