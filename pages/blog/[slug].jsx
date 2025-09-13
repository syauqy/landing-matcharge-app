import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Markdown from "markdown-to-jsx";
import { format, parseISO } from "date-fns";
import { NextSeo } from "next-seo";
import { Navbar } from "@/components/layouts/navbar";
import Link from "next/link";
import { Footer } from "@/components/layouts/footer";
import { WaitlistForm } from "@/components/WaitlistForm";

export async function getStaticPaths() {
  const blogDir = path.join(process.cwd(), "public/content/blog");
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
  const paths = files.map((filename) => ({
    params: { slug: filename.replace(/\.md$/, "") },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const blogDir = path.join(process.cwd(), "public/content/blog");
  const filePath = path.join(blogDir, `${params.slug}.md`);
  const content = fs.readFileSync(filePath, "utf8");
  const { data, content: mdContent } = matter(content);

  // Get all posts for finding related ones
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
  const allPosts = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const fullPath = path.join(blogDir, filename);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data: postData } = matter(fileContents);
    return {
      slug,
      title: postData.title || slug,
      categories: postData.categories || [],
      date: postData.date || null,
      image: postData.image || null,
      excerpt: postData.excerpt || "",
    };
  });

  const currentCategories = data.categories || [];
  const relatedByCategory = allPosts.filter((post) => {
    if (post.slug === params.slug) return false;
    const postCategories = post.categories || [];
    return postCategories.some((cat) => currentCategories.includes(cat));
  });

  const sortedPosts = allPosts.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  let relatedPosts = [...relatedByCategory];
  const relatedSlugs = new Set(relatedPosts.map((p) => p.slug));

  for (const post of sortedPosts) {
    if (relatedPosts.length >= 3) break;
    if (post.slug !== params.slug && !relatedSlugs.has(post.slug)) {
      relatedPosts.push(post);
      relatedSlugs.add(post.slug);
    }
  }

  return {
    props: {
      title: data.title || params.slug,
      date: data.date || "",
      body: mdContent,
      image: data.image || null,
      excerpt: data.excerpt || "",
      meta_title: data.meta_title || data.title || params.slug,
      meta_description: data.meta_description || data.excerpt || "",
      relatedPosts: relatedPosts.slice(0, 4),
      slug: params.slug,
    },
  };
}

export default function BlogPost({
  title,
  date,
  body,
  image,
  relatedPosts,
  meta_title,
  meta_description,
  slug,
}) {
  return (
    <div className="min-h-screen bg-base-100">
      <NextSeo
        title={`${meta_title} - Wetonscope`}
        description={meta_description}
        openGraph={{
          type: "website",
          locale: "en_US",
          url: "https://wetonscope.com/blog",
          siteName: "Wetonscope",
          title: meta_title,
          description: meta_description,
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: "Wetonscope App Preview",
            },
          ],
        }}
        canonical={`https://wetonscope.com/blog/${slug}`}
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
      <div className="max-w-3xl mx-auto p-8 pb-20">
        <Link
          href="/blog"
          className="mb-6 inline-block font-semibold text-batik-text hover:underline"
        >
          &larr; Back to all posts
        </Link>
        <div className="relative h-52 overflow-clip rounded-lg mb-6">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <div className="text-gray-500 text-base mb-6">
          {date && format(parseISO(date), "MMMM dd, yyyy")}
        </div>

        <article className="prose prose-lg max-w-none">
          <Markdown
            options={{
              overrides: {
                h1: {
                  props: {
                    className: "text-3xl font-bold text-batik-black mb-6",
                  },
                },
                h2: {
                  props: {
                    className:
                      "text-2xl font-semibold text-batik-black mt-4 mb-4",
                  },
                },
                h3: {
                  props: {
                    className:
                      "text-xl font-semibold text-batik-black mt-8 mb-4",
                  },
                },
                h4: {
                  props: {
                    className:
                      "text-lg font-semibold text-batik-black mt-6 mb-3",
                  },
                },
                p: {
                  props: {
                    className: "text-batik-black mb-4 mt-2 leading-relaxed",
                  },
                },
                strong: {
                  props: {
                    className: "font-semibold",
                  },
                },
                table: {
                  props: {
                    className:
                      "min-w-full border border-batik-border rounded-lg overflow-hidden my-6",
                  },
                },
                thead: {
                  props: {
                    className: "bg-batik-light",
                  },
                },
                tbody: {
                  props: {
                    className: "",
                  },
                },
                tr: {
                  props: {
                    className: "border-b border-batik-border",
                  },
                },
                th: {
                  props: {
                    className:
                      "px-4 py-2 text-left font-semibold bg-batik-light text-batik-black",
                  },
                },
                td: {
                  props: {
                    className: "px-4 py-2 text-batik-black",
                  },
                },
                ul: {
                  props: {
                    className: "list-disc pl-4 mb-4",
                  },
                },
                img: {
                  props: {
                    className: "w-full h-36 object-cover my-2",
                  },
                },
              },
            }}
          >
            {body}
          </Markdown>
        </article>

        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-batik-black">
              Related Articles
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((post) => (
                <li
                  key={post.slug}
                  className="bg-white border border-batik-border rounded-3xl shadow overflow-hidden flex flex-col"
                >
                  {post.image && (
                    <Link href={`/blog/${post.slug}`}>
                      <div className="relative h-40 overflow-clip">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                    </Link>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-2 mt-auto mb-2">
                      {post.categories.map((cat) => (
                        <div
                          key={cat}
                          className="bg-batik text-batik-text text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xl font-bold text-batik-black hover:underline mt-2"
                    >
                      {post.title}
                    </Link>
                    <div className="text-gray-700 my-3 flex-grow line-clamp-3 text-sm">
                      {post.excerpt}
                    </div>
                    <div className="text-gray-700 font-medium text-sm">
                      {post.date &&
                        format(parseISO(post.date), "MMMM dd, yyyy")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
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
