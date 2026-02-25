import React from "react";
import BlogCard from "./BlogCard";

/**
 * Related Articles Component - shows similar posts
 */
export function RelatedArticles({ posts = [], title = "Related Articles" }) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[1.375rem] font-bold text-[#111] tracking-tight">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

export default RelatedArticles;

