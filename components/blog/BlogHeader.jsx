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
    <article className="mb-8">
      {/* Featured Image */}
      {/* {image && (
        <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8 bg-base-200">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )} */}

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-base-content capitalize">
        {title}
      </h1>

      {/* Description */}
      {description && (
        <p className="text-lg text-base-content/70 mb-6">{description}</p>
      )}

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-6 py-6 border-y border-base-300">
        {/* Author */}
        {author && (
          <div className="flex items-center gap-3">
            {author === "Matcharge Team" ? (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-base-200 flex items-center justify-center">
                <Image
                  src="/matcharge-icon.jpg"
                  alt={author}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary text-sm">
                  {author.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-base-content">{author}</p>
              <p className="text-xs text-base-content/60">Author</p>
            </div>
          </div>
        )}

        {/* Date */}
        <div className="text-sm">
          <p className="font-medium text-base-content">
            {format(publishDate, "MMMM dd, yyyy")}
          </p>
          <p className="text-xs text-base-content/60">Published</p>
        </div>

        {/* Reading Time */}
        {readingTime && (
          <div className="text-sm">
            <p className="font-medium text-base-content">{readingTime} min</p>
            <p className="text-xs text-base-content/60">Read Time</p>
          </div>
        )}
      </div>

      {/* Tags and Categories */}
      {(tags.length > 0 || categories.length > 0) && (
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="inline-block px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary"
            >
              {category}
            </span>
          ))}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-4 py-2 text-sm rounded-full bg-base-200 text-base-content/70 hover:bg-base-300 transition-colors"
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
