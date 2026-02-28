/**
 * Extract headings from MDX content for table of contents
 * Extracts H2 and H3 from the article content (H1 is the post title, added separately)
 */
export function extractHeadingsFromContent(content) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = generateId(text);

    // Include H2 and H3 from content (H1 is the post title)
    if (level >= 2 && level <= 3) {
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
 * Handles articles where H1 is the post title and H2/H3 are content sections
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
      // H1 is the main title (post title)
      tree.push(item);
      stack = [item];
    } else if (heading.level === 2) {
      // H2 becomes first child level under H1
      if (stack[0]) {
        stack[0].children.push(item);
        stack[1] = item;
      }
    } else if (heading.level === 3) {
      // H3 becomes child of H2
      if (stack[1]) {
        stack[1].children.push(item);
      } else if (stack[0]) {
        stack[0].children.push(item);
      }
    }
  });

  return tree;
}
