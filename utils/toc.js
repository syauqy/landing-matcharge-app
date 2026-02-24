/**
 * Extract headings from MDX content for table of contents
 */
export function extractHeadingsFromContent(content) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = generateId(text);

    if (level <= 3) {
      // Only include h1, h2, h3 in TOC
      headings.push({
        level,
        text,
        id,
      });
    }
  }

  return headings;
}

/**
 * Generate URL-friendly ID from text
 */
function generateId(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
}

/**
 * Build table of contents tree structure
 */
export function buildTocTree(headings) {
  const tree = [];
  let stack = [];

  headings.forEach((heading) => {
    const item = {
      ...heading,
      children: [],
    };

    if (heading.level === 1) {
      tree.push(item);
      stack = [item];
    } else if (heading.level === 2) {
      if (stack[0]) {
        stack[0].children.push(item);
        stack[1] = item;
      }
    } else if (heading.level === 3) {
      if (stack[1]) {
        stack[1].children.push(item);
      } else if (stack[0]) {
        stack[0].children.push(item);
      }
    }
  });

  return tree;
}
