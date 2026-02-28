import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { NextSeo, ArticleJsonLd, BreadcrumbJsonLd } from "next-seo";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import {
  getBlogPostBySlug,
  getBlogPostSlugs,
  getRelatedPosts,
} from "@/utils/blog";
import { extractHeadingsFromContent, buildTocTree } from "@/utils/toc";
import { MDXComponents } from "@/utils/mdx-components";
import BlogHeader from "@/components/blog/BlogHeader";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedArticles from "@/components/blog/RelatedArticles";
import { format } from "date-fns";

/**
 * Extract FAQ Q&A pairs from MDX content.
 * Looks for a `## FAQ` section, then `### Question` / paragraph Answer patterns.
 */
function extractFaqFromContent(content) {
  const faqStart = content.search(/^## FAQ/im);
  if (faqStart === -1) return null;

  const faqSection = content.slice(faqStart);
  const questionRe = /^### (.+)\n+([^#]+)/gm;
  const questions = [];
  let match;

  while ((match = questionRe.exec(faqSection)) !== null) {
    const question = match[1].trim();
    const answer = match[2].replace(/\n+/g, " ").trim();
    if (question && answer) {
      questions.push({ question, answer });
    }
  }

  if (questions.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

export default function BlogDetailPage({
  post,
  mdxSource,
  relatedPosts,
  headingTree,
  faqSchema,
}) {
  const [activeHeading, setActiveHeading] = useState(null);

  useEffect(() => {
    // Scroll spy for active heading
    const handleScroll = () => {
      const headingElements = document.querySelectorAll("h2, h3");
      let current = null;

      for (const heading of headingElements) {
        const rect = heading.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2) {
          current = heading.id;
        } else {
          break;
        }
      }

      setActiveHeading(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const publishDate = new Date(post.date);
  const canonicalUrl = `https://www.matcharge.app/blog/${post.slug}`;
  const imageUrl = post.image || "https://www.matcharge.app/og-default.jpg";

  return (
    <>
      <NextSeo
        title={`${post.title}`}
        description={post.description}
        canonical={canonicalUrl}
        openGraph={{
          type: "article",
          url: canonicalUrl,
          title: post.title,
          description: post.description,
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
          article: {
            publishedTime: post.date,
            authors: [post.author || "Matcharge"],
            tags: post.tags || [],
          },
        }}
        twitter={{
          handle: "@matcharge",
          cardType: "summary_large_image",
        }}
      />

      <ArticleJsonLd
        url={canonicalUrl}
        title={post.title}
        images={[imageUrl]}
        datePublished={post.date}
        dateModified={post.date}
        authorName={[post.author || "Matcharge"]}
        description={post.description}
        wordCount={post.content ? post.content.split(/\s+/).length : undefined}
      />

      <BreadcrumbJsonLd
        itemListElements={[
          { position: 1, name: "Home", item: "https://www.matcharge.app" },
          { position: 2, name: "Blog", item: "https://www.matcharge.app/blog" },
          { position: 3, name: post.title, item: canonicalUrl },
        ]}
      />

      {faqSchema && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        </Head>
      )}

      <Navbar bg="bg-white" page="blog" />

      <main className="bg-white">
        {/* Back Button */}
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Blog Header */}
        <div className="border-b border-gray-100 py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-[820px]">
              <BlogHeader
                title={post.title}
                description={post.description}
                date={post.date}
                author={post.author}
                readingTime={post.readingTime}
                image={post.image}
                tags={post.tags}
                categories={post.categories}
              />
            </div>
          </div>
        </div>

        {/* Main Content + TOC */}
        <div className="bg-[#fafafa] py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex gap-14 items-start">
              {/* Article */}
              <article className="flex-1 min-w-0 max-w-[820px]">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-5 py-8 md:px-12 md:py-12">
                  <MDXRemote {...mdxSource} components={MDXComponents} />
                </div>

                {/* Author bio */}
                {/* {post.author && (
                  <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-8 py-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="font-bold text-base text-primary">
                        {post.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#111] text-sm">
                        {post.author}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Matcharge contributor
                      </p>
                    </div>
                  </div>
                )} */}
              </article>

              {/* Sticky TOC — desktop only */}
              {headingTree && headingTree.length > 0 && (
                <aside className="hidden lg:block w-56 shrink-0 sticky top-[100px] self-start">
                  <TableOfContents
                    headings={headingTree}
                    active={activeHeading}
                  />
                </aside>
              )}
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="border-t border-gray-100 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
              <RelatedArticles posts={relatedPosts} />
            </div>
          </div>
        )}
      </main>

      <Footer bg="bg-white" hideBadges />
    </>
  );
}

export async function getStaticProps({ params }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  // Serialize MDX content
  const mdxSource = await serialize(post.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ],
    },
  });

  // Extract headings for TOC
  const headings = extractHeadingsFromContent(post.content);
  
  // Prepend post title as H1 to TOC
  const allHeadings = [
    {
      level: 1,
      text: post.title,
      id: "article-title",
    },
    ...headings,
  ];
  
  const headingTree = buildTocTree(allHeadings) || [];

  // Get related posts
  const relatedPosts = getRelatedPosts(post.slug, 3) || [];

  // Extract FAQ schema from content
  const faqSchema = extractFaqFromContent(post.content);

  return {
    props: {
      post,
      mdxSource,
      relatedPosts: relatedPosts || [],
      headingTree: headingTree || [],
      faqSchema: faqSchema ?? null,
    },
    revalidate: 3600, // Revalidate every hour
  };
}

export async function getStaticPaths() {
  const paths = getBlogPostSlugs();

  return {
    paths,
    fallback: "blocking",
  };
}
