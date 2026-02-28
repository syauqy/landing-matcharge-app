/**
 * Extract headings from MDX content for table of contents
 * Includes H2 and H3 (since H1 is reserved for BlogHeader component)
 */
export function extractHeadingsFromContent(content) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = generateId(text);

    // Include H1-H3, but H1 is legacy support
    if (level >= 1 && level <= 3) {
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
 * Handles articles where main heading is H2 (since H1 is reserved for BlogHeader)
 */
export function buildTocTree(headings) {
  const tree = [];
  let stack = [];

  headings.forEach((heading) => {
    const item = {
      ...heading,
      children: [],
    };

    if (heading.level === 2) {
      // H2 is now the root level for blog articles
      tree.push(item);
      stack = [item];
    } else if (heading.level === 3) {
      // H3 becomes first child level
      if (stack[0]) {
        stack[0].children.push(item);
        stack[1] = item;
      } else {
        tree.push(item); // Fallback if no H2 parent
      }
    } else if (heading.level === 1) {
      // Legacy support for articles with H1
      tree.push(item);
      stack = [item];
    }
  });

  return tree;
}
