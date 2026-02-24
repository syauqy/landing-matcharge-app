import React from "react";
import clsx from "clsx";

/**
 * Table of Contents Component
 */
export function TableOfContents({ headings, active = null }) {
  if (!headings || headings.length === 0) {
    return null;
  }

  const renderHeadings = (items, baseLevel = 1) => {
    return (
      <ul className="space-y-2">
        {items.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={clsx(
                "text-sm transition-colors duration-200 hover:text-primary",
                active === heading.id
                  ? "text-primary font-semibold"
                  : "text-base-content/70",
              )}
              style={{
                paddingLeft: `${(heading.level - 1) * 0.75}rem`,
              }}
            >
              {heading.text}
            </a>
            {heading.children && heading.children.length > 0 && (
              <ul className="mt-1">
                {heading.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className={clsx(
                        "text-xs transition-colors duration-200 hover:text-primary block",
                        active === child.id
                          ? "text-primary font-semibold"
                          : "text-base-content/60",
                      )}
                      style={{
                        paddingLeft: `${(child.level - 1) * 0.75}rem`,
                      }}
                    >
                      {child.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-lg p-4 sticky top-24">
      <h3 className="font-bold text-sm uppercase text-base-content/70 mb-4 tracking-wide">
        Table of Contents
      </h3>
      {renderHeadings(headings)}
    </div>
  );
}

export default TableOfContents;
