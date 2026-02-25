import React from "react";

/**
 * Custom MDX components — Stripe-quality editorial typography
 */

// --- Callout components (use in MDX as <Note>, <Tip>, <Warning>) ---

const Note = ({ children }) => (
  <div className="border-l-4 border-primary bg-primary/5 rounded-r-lg px-5 py-4 mb-6 text-[0.9375rem] text-[#1a1a1a] leading-[1.7]">
    <p className="font-semibold text-primary text-xs uppercase tracking-widest mb-1.5">
      Note
    </p>
    {children}
  </div>
);

const Tip = ({ children }) => (
  <div className="border-l-4 border-emerald-400 bg-emerald-50 rounded-r-lg px-5 py-4 mb-6 text-[0.9375rem] text-[#1a1a1a] leading-[1.7]">
    <p className="font-semibold text-emerald-600 text-xs uppercase tracking-widest mb-1.5">
      Tip
    </p>
    {children}
  </div>
);

const Warning = ({ children }) => (
  <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-lg px-5 py-4 mb-6 text-[0.9375rem] text-[#1a1a1a] leading-[1.7]">
    <p className="font-semibold text-amber-600 text-xs uppercase tracking-widest mb-1.5">
      Warning
    </p>
    {children}
  </div>
);

// Highlight — for a key insight/stat that breaks visual monotony
const Highlight = ({ children }) => (
  <div className="my-10 py-8 px-8 bg-[#111] rounded-2xl text-white text-[1.25rem] md:text-[1.375rem] font-semibold leading-snug tracking-tight text-center">
    {children}
  </div>
);

// Callout — general purpose pull-quote style break
const Callout = ({ children, icon }) => (
  <div className="my-8 flex gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
    {icon && <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>}
    <div className="text-[1.0625rem] text-[#374151] leading-[1.75]">
      {children}
    </div>
  </div>
);

export const MDXComponents = {
  // Callouts
  Note,
  Tip,
  Warning,
  Highlight,
  Callout,

  // Headings
  h1: ({ children }) => (
    <h1 className="text-[2rem] md:text-[2.375rem] font-bold mb-5 mt-0 text-[#111] leading-tight tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="text-[1.5rem] md:text-[1.625rem] font-bold mb-4 mt-12 pb-3 border-b border-gray-100 text-[#111] leading-snug tracking-tight"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3
      id={id}
      className="text-[1.1875rem] md:text-[1.25rem] font-semibold mb-3 mt-9 text-[#111] leading-snug"
    >
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4
      id={id}
      className="text-[1.0625rem] font-semibold mb-2 mt-6 text-[#111]"
    >
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-base font-semibold mb-2 mt-5 text-[#111]">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-sm font-semibold mb-2 mt-4 text-[#444] uppercase tracking-wide">
      {children}
    </h6>
  ),

  // Paragraphs and text
  p: ({ children }) => (
    <p className="text-[1.0625rem] leading-[1.75] mb-5 text-[#374151]">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity duration-150"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="list-disc ml-6 mb-5 text-[#374151] text-[1.0625rem] leading-[1.75] space-y-1.5">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal ml-6 mb-5 text-[#374151] text-[1.0625rem] leading-[1.75] space-y-1.5">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,

  // Code blocks
  pre: ({ children }) => (
    <pre className="bg-[#f6f8fa] border border-gray-200 rounded-xl p-5 mb-6 overflow-auto text-sm leading-relaxed">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-gray-100 text-[#c7254e] px-1.5 py-0.5 rounded text-[0.875em] font-mono">
          {children}
        </code>
      );
    }
    return <code className="font-mono text-sm text-[#333]">{children}</code>;
  },

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-200 pl-5 py-1 mb-6 italic text-gray-500 rounded-r-md">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => <hr className="my-10 border-t border-gray-100" />,

  // Table
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6 rounded-xl border border-gray-100">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50 border-b border-gray-100">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-gray-100 last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-semibold text-[#111] text-xs uppercase tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-[#374151]">{children}</td>
  ),

  // Images
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-xl my-6 shadow-sm border border-gray-100"
    />
  ),

  // Emphasis
  em: ({ children }) => <em className="italic">{children}</em>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[#111]">{children}</strong>
  ),
};
