import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

export async function generateKeywords(seed, existingSlugs = []) {
  const prompt = `
Generate 5 long-tail SEO blog keywords related to:"${seed}"

Rules:
- Low competition
- Avoid generating topics similar to:${existingSlugs.join("\n")}
- Specific
- Avoid generic finance topics
- Return as plain list only
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return text
    .split("\n")
    .map((line) => line.replace(/^\d+[\).\s-]*/, "").trim())
    .filter(Boolean);
}

export async function generateArticle(keyword) {
  const prompt = `
Write a 1500-word SEO blog article targeting:
"${keyword}"

Requirements:
- One H1
- Structured H2 and H3
- Practical step-by-step guidance
- FAQ section (4 questions)
- Calm modern tone
- No fluff
- End with {{CTA_BLOCK}}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
