import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { NextSeo, ArticleJsonLd } from "next-seo";
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

export default function BlogDetailPage({
  post,
  mdxSource,
  relatedPosts,
  headingTree,
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
  const canonicalUrl = `https://matcharge.app/blog/${post.slug}`;
  const imageUrl = post.image || "https://matcharge.app/og-default.jpg";

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
            authors: [post.author || "Matcharge Team"],
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
        authorName={[post.author || "Matcharge Team"]}
        description={post.description}
      />

      <Navbar bg="bg-base-100" page="blog" />

      <main className="bg-base-100">
        {/* Back Button */}
        <div className="border-b border-base-300 bg-base-100">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
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
        <div className="border-b border-base-300 py-12 md:py-16">
          <div className="container mx-auto px-4">
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

        {/* Main Content */}
        <div className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Article Content */}
              <div className="lg:col-span-3">
                <article className="prose prose-sm md:prose-base max-w-none text-base-content">
                  <MDXRemote {...mdxSource} components={MDXComponents} />
                </article>

                {/* Author bio */}
                {post.author && (
                  <div className="mt-12 pt-8 border-t border-base-300">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-lg text-primary">
                          {post.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-base-content mb-1">
                          {post.author}
                        </h4>
                        <p className="text-sm text-base-content/70">
                          Matcharge contributor
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Table of Contents */}
                {headingTree && headingTree.length > 0 && (
                  <div className="lg:sticky lg:top-24">
                    <TableOfContents
                      headings={headingTree}
                      active={activeHeading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="bg-base-200/30 border-t border-base-300">
            <div className="container mx-auto px-4 py-12 md:py-16">
              <RelatedArticles posts={relatedPosts} />
            </div>
          </div>
        )}
      </main>

      <Footer bg="bg-base-200" />
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
  const headingTree = buildTocTree(headings);

  // Get related posts
  const relatedPosts = getRelatedPosts(post.slug, 3);

  return {
    props: {
      post,
      mdxSource,
      relatedPosts,
      headingTree,
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
