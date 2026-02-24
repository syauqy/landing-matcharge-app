import React from "react";
import clsx from "clsx";

/**
 * Custom MDX components with Tailwind styling
 */

export const MDXComponents = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-4xl font-bold mb-6 mt-8 text-base-content first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-3xl font-bold mb-4 mt-8 text-base-content">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-2xl font-bold mb-3 mt-6 text-base-content">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xl font-bold mb-2 mt-4 text-base-content">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-lg font-bold mb-2 mt-4 text-base-content">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-base font-bold mb-2 mt-4 text-base-content">
      {children}
    </h6>
  ),

  // Paragraphs and text
  p: ({ children }) => (
    <p className="text-base leading-relaxed mb-4 text-base-content">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary hover:text-primary-dark underline transition-colors duration-200"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 text-base-content">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 text-base-content">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mb-2 ml-4">{children}</li>,

  // Code blocks
  pre: ({ children }) => (
    <pre className="bg-base-200 border border-base-300 rounded-lg p-4 mb-4 overflow-auto">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-base-200 px-2 py-1 rounded text-sm font-mono text-error">
          {children}
        </code>
      );
    }
    return (
      <code className="font-mono text-sm text-base-content">{children}</code>
    );
  },

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary pl-4 py-2 mb-4 italic text-base-content bg-base-100 rounded-r-lg">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => <hr className="my-8 border-t-2 border-base-300" />,

  // Table
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-base-200">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-base-300">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="p-3 text-left font-bold text-base-content">{children}</th>
  ),
  td: ({ children }) => <td className="p-3 text-base-content">{children}</td>,

  // Images
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg my-4 shadow-md"
    />
  ),

  // Emphasis
  em: ({ children }) => <em className="italic">{children}</em>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
};
