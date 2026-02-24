import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
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

  const canonicalUrl = `https://matcharge.app/blog${currentPage > 1 ? `?page=${currentPage}` : ""}`;

  return (
    <>
      <NextSeo
        title={currentPage > 1 ? `Blog - Page ${currentPage}` : "Blog "}
        description="Discover articles about electric vehicle charging, optimization tips, and industry insights."
        canonical={canonicalUrl}
        openGraph={{
          type: "website",
          url: canonicalUrl,
          title: "Blog ",
          description:
            "Discover articles about electric vehicle charging, optimization tips, and industry insights.",
          images: [
            {
              url: "https://matcharge.app/og-blog.jpg",
              width: 1200,
              height: 630,
              alt: "Matcharge Blog",
            },
          ],
        }}
      />

      <Navbar bg="bg-base-100" page="blog" />

      <main className="min-h-screen bg-base-100">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
                Matcharge Blog
              </h1>
              <p className="text-lg text-base-content/70 mb-8">
                Stay updated with the latest insights on EV charging
                optimization, best practices, and industry trends.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-4 pr-10"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50"
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
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            {filteredPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredPosts.map((post, index) => (
                    <BlogCard
                      key={post.slug}
                      post={post}
                      featured={index === 0 && currentPage === 1}
                    />
                  ))}
                </div>

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
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-base-content/30 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-base-content mb-2">
                  No articles found
                </h3>
                <p className="text-base-content/60">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "No articles available yet."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer bg="bg-base-200" />
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
