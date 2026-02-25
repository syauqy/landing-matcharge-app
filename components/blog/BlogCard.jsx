import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import clsx from "clsx";

/**
 * Blog Card Component — Stripe-style minimal design
 */
export function BlogCard({ post, featured = false }) {
  const publishDate = new Date(post.date);

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        className={clsx(
          "group h-full bg-white rounded-2xl overflow-hidden",
          "border border-gray-100",
          "shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]",
          "transition-all duration-300 cursor-pointer",
        )}
      >
        <div className="p-6 md:p-7 flex flex-col gap-4">
          {/* Category tag */}
          {post.categories && post.categories.length > 0 && (
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              {post.categories[0]}
            </span>
          )}

          {/* Title */}
          <h3
            className={clsx(
              "font-bold leading-snug text-[#111] group-hover:text-primary transition-colors duration-200",
              featured ? "text-2xl" : "text-lg",
            )}
          >
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
            {post.description}
          </p>

          {/* Footer: meta + tag */}
          <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <time dateTime={post.date}>
                {format(publishDate, "MMM dd, yyyy")}
              </time>
              {post.readingTime && (
                <>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/8 text-primary">
                #{post.tags[0]}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BlogCard;
