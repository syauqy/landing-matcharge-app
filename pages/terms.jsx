import { useState, useEffect } from "react";
import Markdown from "markdown-to-jsx";

export default function Terms() {
  const [content, setContent] = useState("");

  useEffect(() => {
    // Fetch the markdown content
    fetch("/content/terms.md")
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch((err) => console.error("Error loading terms of service:", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-base relative">
      {/* <DashboardNavbar /> */}

      <main className="flex-grow p-5 md:p-6 pb-24">
        <div className="max-w-3xl mx-auto bg-base-100">
          <article className="prose prose-stone max-w-none">
            <Markdown
              options={{
                overrides: {
                  h1: {
                    component: ({ children }) => (
                      <h1 className="text-3xl font-bold text-batik-black mb-6">
                        {children}
                      </h1>
                    ),
                  },
                  h3: {
                    component: ({ children }) => (
                      <h3 className="text-xl font-semibold text-batik-black mt-8 mb-4">
                        {children}
                      </h3>
                    ),
                  },
                  p: {
                    component: ({ children }) => (
                      <p className="text-batik-black mb-4">{children}</p>
                    ),
                  },
                  strong: {
                    component: ({ children }) => (
                      <strong className="font-semibold ">{children}</strong>
                    ),
                  },
                  ul: {
                    component: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4 text-batik-black">
                        {children}
                      </ul>
                    ),
                  },
                  li: {
                    component: ({ children }) => (
                      <li className="mb-2">{children}</li>
                    ),
                  },
                  a: {
                    component: ({ children, href }) => (
                      <a className="text-batik-text underline" href={href}>
                        {children}
                      </a>
                    ),
                  },
                },
              }}
            >
              {content}
            </Markdown>
          </article>
        </div>
      </main>

      {/* <Menubar page="profile" /> */}
    </div>
  );
}
