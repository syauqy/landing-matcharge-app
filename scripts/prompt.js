function buildPrompt(keyword) {
  return `
You are writing an SEO-focused blog article.

Target keyword: "${keyword}"

Requirements:
- 1200–1600 words
- Clear H1 (only one)
- Structured H2 and H3 headings
- Practical step-by-step guidance
- Calm, modern tone
- No fluff
- Include FAQ section (4 questions)
- Do NOT mention AI
- Use Markdown formatting

Include these placeholders naturally in the content:
{{INTERNAL_LINK_1}}
{{INTERNAL_LINK_2}}

End the article with:
{{CTA_BLOCK}}
`;
}

module.exports = { buildPrompt };
