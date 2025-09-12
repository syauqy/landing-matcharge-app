import { useState, useEffect } from "react";
import Link from "next/link";
import { Abhaya_Libre } from "next/font/google";
import clsx from "clsx";
import { AppStore } from "@/components/icons";

const abhaya = Abhaya_Libre({
  weight: "800",
  subsets: ["latin"],
});

export function Navbar({ bg, page }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHasScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        "sticky top-0 z-40 transition-colors duration-200",
        hasScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : bg
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className={clsx(
              "text-4xl font-bold text-batik-black",
              abhaya.className
            )}
          >
            Wetonscope
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* <Link href="/" className="text-gray-700 hover:text-batik-text">
              Home
            </Link> */}
            <Link
              href="/blog"
              className={clsx(
                page === "blog"
                  ? "text-batik-text underline underline-offset-2"
                  : "text-gray-700",
                " hover:text-batik-text font-semibold"
              )}
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className={clsx(
                page === "contact"
                  ? "text-batik-text underline underline-offset-2"
                  : "text-gray-700",
                " hover:text-batik-text font-semibold"
              )}
            >
              Contact
            </Link>
            {/* <Link href="/support" className="text-gray-700 hover:text-batik-text">
              Support
            </Link> */}
            {/* <Link href="/about" className="text-gray-700 hover:text-batik-text">
              About
            </Link>
            <Link href="/weton" className="text-gray-700 hover:text-batik-text">
              Check Your Weton
            </Link> */}
            {/* <a
              href="https://apps.apple.com/your-app-link"
              className=" px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <AppStore className="w-32" />
            </a> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Popover */}
        {/* {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200">
            <div className="flex flex-col space-y-4 px-4 py-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-batik-text"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-batik-text"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <a
                href="https://apps.apple.com/your-app-link"
                className="bg-batik-black text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                Download
              </a>
            </div>
          </div>
        )} */}
      </div>
    </nav>
  );
}
