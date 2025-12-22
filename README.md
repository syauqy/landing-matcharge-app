# Matcharge Landing Page

This is the landing page project for **Matcharge**, a beautiful and insightful app to track your recurring bills, visualize your spending, and end the stress of surprise charges.

## Features

- Modern, responsive landing page built with Next.js and Tailwind CSS
- App Store badge and iPhone mockup preview
- Feature highlights and product description
- SEO and social sharing optimized

Additional homepage updates:

- Features section now includes a title and subtitle and displays feature mockups in a two-column layout on large screens.
- Feature images are served from `public/mockups/` (e.g. `matcharge-mockup-1.webp` through `matcharge-mockup-4.webp`).
- An FAQ section was added below the Features section and uses DaisyUI's `collapse` accordion styling.
- FAQ content has been extracted to `data/faq.js` and is imported into `pages/index.jsx` to keep content separate from layout.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Deployment

You can deploy this landing page to Vercel, Netlify, or any platform that supports Next.js.

## Customization

- Update images, app store links, and feature descriptions in `pages/index.jsx` as needed.
- SEO and Open Graph settings are in the same file.

Notes for developers:

- If you modify the FAQ, edit `data/faq.js` instead of editing `pages/index.jsx` directly.
- The FAQ UI uses DaisyUI classes (`collapse`, `collapse-arrow`, etc.); ensure DaisyUI is enabled in your Tailwind config.
- Mockup images live in `public/mockups/` — replace or add new images there and update `pages/index.jsx` if you change filenames.

## License

This project is for the Matcharge landing page. All rights reserved.
