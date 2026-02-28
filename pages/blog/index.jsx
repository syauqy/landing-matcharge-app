import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { format } from "date-fns";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import BlogCard from "@/components/blog/BlogCard";
import Pagination from "@/components/blog/Pagination";
import { getPaginatedPosts } from "@/utils/blog";

export default function BlogPage({ initialPosts, totalPages }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const currentPage = router.query.page ? parseInt(router.query.page) : 1;

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [initialPosts, searchQuery]);

  const canonicalUrl = `https://www.matcharge.app/blog${currentPage > 1 ? `?page=${currentPage}` : ""}`;
  const featuredPost =
    !searchQuery && currentPage === 1 && filteredPosts.length > 0
      ? filteredPosts[0]
      : null;
  const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  return (
    <>
      <NextSeo
        title={currentPage > 1 ? `Blog - Page ${currentPage}` : "Blog"}
        description="Discover practical guides to track subscriptions, manage recurring bills, catch forgotten trials, and visualize your spending with Matcharge."
        canonical={canonicalUrl}
        openGraph={{
          type: "website",
          url: canonicalUrl,
          title: "Blog",
          description:
            "Discover practical guides to track subscriptions, manage recurring bills, catch forgotten trials, and visualize your spending with Matcharge.",
          images: [
            {
              url: "https://www.matcharge.app/og-blog.jpg",
              width: 1200,
              height: 630,
              alt: "Matcharge Blog",
            },
          ],
        }}
      />

      <Navbar bg="bg-white" page="blog" />

      <main className="min-h-screen bg-[#fafafa]">
        {/* Header */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
                Matcharge Blog
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#111] leading-tight mb-4">
                Financial clarity,
                <br />
                one guide at a time.
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                Practical guides on tracking subscriptions, catching forgotten
                trials, and taking control of your recurring spending.
              </p>
            </div>

            {/* Search */}
            <div className="relative mt-8 max-w-sm">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-5xl mx-auto px-6 py-14 md:py-20">
          {filteredPosts.length > 0 ? (
            <>
              {/* Featured Article */}
              {featuredPost && (
                <div className="mb-14">
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <article className="group bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-all duration-300 overflow-hidden cursor-pointer">
                      <div className="p-8 md:p-10 md:grid md:grid-cols-5 md:gap-10 md:items-center">
                        {/* Left: badge + title + excerpt */}
                        <div className="md:col-span-3 flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 px-3 py-1 rounded-full uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                              Featured
                            </span>
                            {featuredPost.categories &&
                              featuredPost.categories.length > 0 && (
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                  {featuredPost.categories[0]}
                                </span>
                              )}
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold text-[#111] leading-snug group-hover:text-primary transition-colors duration-200">
                            {featuredPost.title}
                          </h2>
                          <p className="text-gray-500 text-base leading-relaxed line-clamp-3">
                            {featuredPost.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <time dateTime={featuredPost.date}>
                              {format(
                                new Date(featuredPost.date),
                                "MMMM dd, yyyy",
                              )}
                            </time>
                            {featuredPost.readingTime && (
                              <>
                                <span>·</span>
                                <span>{featuredPost.readingTime} min read</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right: CTA */}
                        <div className="md:col-span-2 mt-6 md:mt-0 flex md:justify-end">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-200">
                            Read article
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
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              )}

              {/* Article Grid */}
              {gridPosts.length > 0 && (
                <>
                  {!searchQuery && currentPage === 1 && (
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
                      All Articles
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                    {gridPosts.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/blog"
                />
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm">
                {searchQuery
                  ? `No articles found for "${searchQuery}".`
                  : "No articles available yet."}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer bg="bg-white" hideBadges />
    </>
  );
}

export async function getStaticProps() {
  const postsPerPage = 6;
  const paginatedData = getPaginatedPosts(1, postsPerPage);

  return {
    props: {
      initialPosts: paginatedData.posts,
      totalPages: paginatedData.totalPages,
    },
    revalidate: 3600, // Revalidate every hour
  };
}
