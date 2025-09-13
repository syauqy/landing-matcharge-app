import React from "react";
// import clsx from "clsx";
import Link from "next/link";
import { Abhaya_Libre } from "next/font/google";
import clsx from "clsx";
import { AppStore } from "@/components/icons";

const abhaya = Abhaya_Libre({
  weight: "800",
  subsets: ["latin"],
});

export function Footer({ bg }) {
  return (
    <footer className={clsx(bg, "py-12")}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <Link
              href="/"
              className={clsx(
                "text-5xl font-bold text-batik-black",
                abhaya.className
              )}
            >
              Wetonscope
            </Link>
            <p className="mt-2 mb-4 text-gray-700 font-semibold max-w-sm">
              A modern guide to the ancient Javanese art of self-discovery.
            </p>
            <p className="text-gray-800">
              © 2025 Wetonscope. All rights reserved.
            </p>
          </div>
          <div className="w-full md:w-fit order-first text-center md:text-left flex flex-col gap-2 mb-6 md:mb-0 md:order-none">
            <Link
              href="/check"
              className="font-semibold text-lg text-gray-600 hover:text-batik-text"
            >
              Check Your Weton (Free)
            </Link>
            <Link
              href="/contact"
              className="font-semibold text-lg text-gray-600 hover:text-batik-text"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="font-semibold text-lg text-gray-600 hover:text-batik-text"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-semibold text-lg text-gray-600 hover:text-batik-text"
            >
              Terms of Service
            </Link>

            {/* <a href="/faq" className="text-gray-600 hover:text-batik-text">
              FAQ
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
