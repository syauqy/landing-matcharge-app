import React from "react";
import Image from "next/image";
import { format } from "date-fns";

/**
 * Blog Article Header Component
 */
export function BlogHeader({
  title,
  description,
  date,
  author,
  readingTime,
  image,
  tags = [],
  categories = [],
}) {
  const publishDate = new Date(date);

  return (
    <article className="mb-0">
      {/* Category label */}
      {categories.length > 0 && (
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
          {categories[0]}
        </p>
      )}

      {/* Title */}
      <h1 className="text-[2rem] md:text-[2.625rem] font-bold mb-4 text-[#111] leading-tight tracking-tight">
        {title}
      </h1>

      {/* Description */}
      {description && (
        <p className="text-lg text-gray-500 leading-relaxed mb-7">
          {description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-5 pt-6 border-t border-gray-100">
        {/* Author */}
        {author && (
          <div className="flex items-center gap-2.5">
            {author === "Matcharge Team" ? (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/matcharge-icon.jpg"
                  alt={author}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-primary text-xs">
                  {author.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-[#333]">{author}</span>
          </div>
        )}

        <span className="text-gray-200 select-none">|</span>

        {/* Date */}
        <span className="text-sm text-gray-400">
          {format(publishDate, "MMMM d, yyyy")}
        </span>

        {/* Reading time */}
        {readingTime && (
          <>
            <span className="text-gray-200 select-none">·</span>
            <span className="text-sm text-gray-400">{readingTime} min read</span>
          </>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export default BlogHeader;
