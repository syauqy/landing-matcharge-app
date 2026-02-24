import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import clsx from "clsx";

/**
 * Blog Card Component - displays article preview in a grid
 */
export function BlogCard({ post, featured = false }) {
  const publishDate = new Date(post.date);

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        className={clsx(
          "group h-full rounded-xl border border-base-300 overflow-hidden",
          "hover:shadow-lg hover:border-primary transition-all duration-300",
          "cursor-pointer hover:-translate-y-1",
          featured && "lg:col-span-2 lg:row-span-2",
        )}
      >
        {/* Image */}
        {/* {post.image && (
          <div
            className={clsx(
              "relative bg-base-200 overflow-hidden",
              featured ? "h-64" : "h-48",
            )}
          >
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )} */}

        {/* Content */}
        <div
          className={clsx("p-5 flex flex-col gap-3", featured && "p-6 gap-4")}
        >
          {/* Meta info */}
          <div className="flex items-center gap-3 text-sm text-base-content/60">
            <time dateTime={post.date}>
              {format(publishDate, "MMM dd, yyyy")}
            </time>
            {post.readingTime && (
              <>
                <span>•</span>
                <span>{post.readingTime} min read</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            className={clsx(
              "font-bold text-base-content group-hover:text-primary transition-colors",
              featured ? "text-2xl line-clamp-2" : "text-lg line-clamp-3",
            )}
          >
            {post.title}
          </h3>

          {/* Description */}
          <p
            className={clsx(
              "text-base-content/70 line-clamp-2",
              featured && "line-clamp-3",
            )}
          >
            {post.description}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          {post.author && (
            <div className="text-sm text-base-content/60 pt-2 border-t border-base-300">
              By <span className="font-medium">{post.author}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

export default BlogCard;
