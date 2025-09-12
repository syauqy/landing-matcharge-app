import { useState, useEffect } from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";
import Image from "next/image";
import { NextSeo } from "next-seo";
import clsx from "clsx";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { WaitlistForm } from "@/components/WaitlistForm";
import { format, parseISO } from "date-fns";
import { Abhaya_Libre } from "next/font/google";

const abhaya = Abhaya_Libre({
  weight: "800",
  subsets: ["latin"],
});

export async function getStaticProps() {
  const blogDir = path.join(process.cwd(), "public/content/blog");
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
  const posts = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(blogDir, filename);
    const content = fs.readFileSync(filePath, "utf8");
    const { data } = matter(content);
    return {
      slug,
      title: data.title || slug,
      excerpt: data.excerpt || "",
      date: data.date || "",
      categories: data.categories || [],
      image: data.image || null,
    };
  });
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const allCategories = [...new Set(posts.flatMap((p) => p.categories))].sort();

  return { props: { posts, categories: ["All", ...allCategories] } };
}

export default function BlogIndex({ posts, categories }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredPosts, setFilteredPosts] = useState(posts);

  //   console.log(posts);

  useEffect(() => {
    const newPosts =
      selectedCategory === "All"
        ? posts
        : posts.filter((post) => post.categories.includes(selectedCategory));
    setFilteredPosts(newPosts);
  }, [selectedCategory, posts]);

  return (
    <div className="min-h-screen bg-base-100">
      <NextSeo
        title="Blog - Wetonscope"
        description="Discover your soul's blueprint with Wetonscope, a modern guide to ancient Javanese wisdom. Get personalized daily readings, relationship compatibility insights, and deep self-discovery through traditional Weton calculations."
        openGraph={{
          type: "website",
          locale: "en_US",
          url: "https://wetonscope.com/blog",
          siteName: "Wetonscope",
          title: "Blog - Wetonscope",
          description:
            "Discover your soul's blueprint with Wetonscope. Get personalized daily readings and relationship insights based on ancient Javanese wisdom.",
          images: [
            {
              url: "/wetonscope-app-hero.png",
              width: 1200,
              height: 630,
              alt: "Wetonscope App Preview",
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content:
              "weton calculator, javanese astrology, horoscope, birth date calculator, relationship compatibility, daily reading, self discovery, primbon jawa, astrology",
          },
          {
            name: "application-name",
            content: "Wetonscope",
          },
        ]}
      />
      <Navbar page={"blog"} />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1
          className={clsx(
            abhaya.className,
            "text-4xl font-bold mb-8 text-center"
          )}
        >
          Wisdom from the Ancient
        </h1>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                selectedCategory === category
                  ? "bg-batik-black text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <li
              key={post.slug}
              className="bg-white border border-batik-border rounded-3xl shadow overflow-hidden flex flex-col"
            >
              {post.image && (
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-42 overflow-clip">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="object-cover w-full h-full justify-center"
                      loading="lazy"
                    />
                  </div>
                </Link>
              )}

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mt-auto mb-2">
                  {post.categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="bg-batik text-batik-text text-xs font-semibold px-2.5 py-0.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className={
                    "text-xl font-bold text-batik-black hover:underline mt-2"
                  }
                >
                  {post.title}
                </Link>
                <div className="text-gray-700 my-3 flex-grow line-clamp-3 text-sm">
                  {post.excerpt}
                </div>
                <div className="text-gray-700 font-medium text-sm">
                  {post.date && format(parseISO(post.date), "MMMM dd, yyyy")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <section className="py-20 bg-gradient-to-b from-white to-batik">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Discover Your True Self?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your journey to clarity, purpose, and deeper self-understanding is
            just a tap away. Download Wetonscope and start living a more aligned
            life today.
          </p>
          <div className="flex flex-col gap-3 justify-center lg:justify-start mt-4">
            <div className="text-xs md:text-sm text-gray-500 w-2/3 justify-center lg:justify-start mx-auto">
              Wetonscope is coming soon. Join our waitlist to get exclusive
              early access and a special founder's gift on launch day.
            </div>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer bg={"bg-batik"} />
    </div>
  );
}
