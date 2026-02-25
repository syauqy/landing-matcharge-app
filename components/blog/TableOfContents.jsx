import React from "react";
import clsx from "clsx";

/**
 * Table of Contents Component — minimal editorial sidebar
 */
export function TableOfContents({ headings, active = null }) {
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <nav className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-5 py-5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-gray-400 mb-4">
        On this page
      </p>

      <ol className="space-y-0.5">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={clsx(
                "group flex items-start gap-2 py-1.5 pl-3 rounded-md text-[0.8125rem] leading-snug transition-colors duration-150",
                active === heading.id
                  ? "text-primary font-medium bg-primary/5"
                  : "text-gray-500 hover:text-[#111] hover:bg-gray-50",
              )}
            >
              {/* <span
                className={clsx(
                  "mt-[0.35rem] w-1 h-1 rounded-full shrink-0 transition-colors duration-150",
                  active === heading.id
                    ? "bg-primary"
                    : "bg-gray-300 group-hover:bg-gray-400",
                )}
              /> */}
              <span className="line-clamp-2">{heading.text}</span>
            </a>

            {heading.children && heading.children.length > 0 && (
              <ul className="ml-4 mt-0.5 space-y-0.5">
                {heading.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className={clsx(
                        "group flex items-start gap-2 py-1.5 pl-3 rounded-md text-[0.75rem] leading-snug transition-colors duration-150",
                        active === child.id
                          ? "text-primary font-medium bg-primary/5"
                          : "text-gray-400 hover:text-[#111] hover:bg-gray-50",
                      )}
                    >
                      {/* <span
                        className={clsx(
                          "mt-[0.35rem] w-1 h-1 rounded-full shrink-0 transition-colors duration-150",
                          active === child.id
                            ? "bg-primary"
                            : "bg-gray-200 group-hover:bg-gray-400",
                        )}
                      /> */}
                      <span className="line-clamp-2">{child.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default TableOfContents;
