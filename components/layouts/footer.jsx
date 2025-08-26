import React from "react";
import clsx from "clsx";

export function Footer({ bg }) {
  return (
    <footer className={clsx(bg, "py-12")}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-800">
              © 2025 Wetonscope. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="text-gray-600 hover:text-batik-text">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-600 hover:text-batik-text">
              Terms of Service
            </a>
            <a href="/contact" className="text-gray-600 hover:text-batik-text">
              Contact
            </a>
            {/* <a href="/faq" className="text-gray-600 hover:text-batik-text">
              FAQ
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
