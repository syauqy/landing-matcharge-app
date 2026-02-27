import React from "react";
// import clsx from "clsx";
import Link from "next/link";
import { Lora } from "next/font/google";
import clsx from "clsx";
import { BadgeMarquee } from "../BadgeMarquee";
// import { AppStore } from "@/components/icons";

const lora = Lora({
  weight: "700",
  subsets: ["latin"],
});

export function Footer({ bg, hideBadges = false }) {
  return (
    <footer className={clsx(bg, "py-12")}>
      <div className="container mx-auto px-4 xl:px-0">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <Link
              href="/"
              className={clsx(
                "text-4xl font-bold text-base-content flex items-center gap-2 justify-center md:justify-start",
                lora.className,
              )}
              aria-label="Pippin Home"
            >
              <img
                src="/matcharge-icon.jpg"
                alt="Matcharge Mascot"
                className="w-8 h-8 md:w-12 md:h-12 inline-block align-middle rounded-2xl overflow-clip object-cover"
              />
              Matcharge
            </Link>
            <p className="mt-2 mb-4 text-gray-700 font-semibold max-w-sm">
              Track your bills, find your calm.
            </p>
            <p>
              Made with ❤️ by{" "}
              <a
                className="font-semibold text-slate-500 hover:text-blue-500 transition-colors"
                href="https://www.syauqy.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                Syauqy
              </a>
            </p>
            <p className="text-gray-800">
              © 2025 Matcharge. All rights reserved.
            </p>
          </div>
          <div className="w-full md:w-fit order-first text-center md:text-left flex flex-col gap-2 mb-6 md:mb-0 md:order-none">
            {/* <Link
              href="/check"
              className="font-semibold text-lg text-gray-600 hover:text-batik-text"
            >
              Check Your Weton (Free)
            </Link> */}
            {/* <Link
              href="/contact"
              className="font-semibold text-lg text-gray-600 hover:text-batik-text"
            >
              Contact
            </Link> */}
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
            <Link
              href="/blog"
              className="font-semibold text-lg text-gray-600 hover:text-batik-text"
            >
              Blog
            </Link>
            <Link
              href="/subscription-leakage-calculator"
              className="font-semibold text-lg text-gray-600 hover:text-batik-text"
            >
              Leakage Calculator
            </Link>
            <div className="mt-3 text-sm flex flex-col items-center md:items-start md:gap-2">
              From the maker of{" "}
              <Link
                href="https://www.getpippin.app"
                className={clsx(
                  "text-lg font-bold text-base-content flex items-center gap-2 justify-center md:justify-start py-2",
                )}
                aria-label="Pippin Home"
              >
                <img
                  src="/pippin-icon.jpg"
                  alt="Pippin Mascot"
                  className="w-8 h-8 md:w-12 md:h-12 inline-block align-middle rounded-xl md:rounded-2xl overflow-clip object-cover"
                />
                <div className="flex flex-col">
                  <p className="leading-5">Pippin</p>
                  <p className=" text-xs max-w-sm font-light text-center">
                    Minimalist journal for overthinkers.
                  </p>
                </div>
              </Link>
            </div>

            {/* <a href="/faq" className="text-gray-600 hover:text-batik-text">
              FAQ
            </a> */}
          </div>
        </div>
        {/* <div className="mt-5 flex justify-center items-center md:justify-start gap-2">
          <a href="https://fazier.com/launches/matcharge.app" target="_blank">
            <img
              src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
              // width={120}
              alt="Fazier badge"
            />
          </a>
          <a
            href="https://turbo0.com/item/matcharge-subscription-manager"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://img.turbo0.com/badge-listed-light.svg"
              alt="Listed on Turbo0"
              style={{ height: "45px", width: "auto" }}
            />
          </a>
          <a
            href="https://findly.tools/matcharge-subscription-manager?utm_source=matcharge-subscription-manager"
            target="_blank"
          >
            <img
              src="https://findly.tools/badges/findly-tools-badge-light.svg"
              alt="Featured on findly.tools"
              width="150"
            />
          </a>
        </div> */}
        {!hideBadges && <BadgeMarquee />}
      </div>
    </footer>
  );
}
