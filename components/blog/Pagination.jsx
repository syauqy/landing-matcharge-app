import React from "react";
import Link from "next/link";
import clsx from "clsx";

/**
 * Pagination Component for Blog Listing
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath = "/blog",
  showEllipsis = true,
}) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      if (startPage > 2 && showEllipsis) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1 && showEllipsis) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {/* Previous button */}
      {hasPrev ? (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="btn btn-sm btn-outline gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </Link>
      ) : (
        <button className="btn btn-sm btn-outline gap-2" disabled>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>
      )}

      {/* Page numbers */}
      <div className="flex gap-1">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-base-content/50"
              >
                {page}
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Link
              key={page}
              href={`${basePath}?page=${page}`}
              className={clsx(
                "btn btn-sm",
                isActive ? "btn-primary" : "btn-ghost",
              )}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next button */}
      {hasNext ? (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="btn btn-sm btn-outline gap-2"
        >
          Next
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      ) : (
        <button className="btn btn-sm btn-outline gap-2" disabled>
          Next
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Pagination;
