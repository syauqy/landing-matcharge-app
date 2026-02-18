import React from "react";
import { motion } from "framer-motion";

const badges = [
  {
    href: "https://fazier.com/launches/matcharge.app",
    src: "https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light",
    alt: "Fazier badge",
  },
  {
    href: "https://turbo0.com/item/matcharge-subscription-manager",
    src: "https://img.turbo0.com/badge-listed-light.svg",
    alt: "Listed on Turbo0",
  },
  {
    href: "https://findly.tools/matcharge-subscription-manager?utm_source=matcharge-subscription-manager",
    src: "https://findly.tools/badges/findly-tools-badge-light.svg",
    alt: "Featured on findly.tools",
  },
  {
    href: "https://dang.ai/",
    src: "https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png",
    alt: "Dang.ai",
  },
  {
    href: "https://launchigniter.com/product/matcharge-subscription-manager?ref=badge-matcharge-subscription-manager",
    src: "https://launchigniter.com/api/badge/matcharge-subscription-manager?theme=light",
    alt: "Featured on LaunchIgniter",
  },
  {
    href: "https://toolfame.com/item/matcharge-subscription-manager",
    src: "https://toolfame.com/badge-light.svg",
    alt: "Featured on toolfame.com",
  },
  {
    href: "https://earlyhunt.com",
    src: "https://earlyhunt.com/badges/earlyhunt-badge-light.svg",
    alt: "Featured on EarlyHunt",
  },
  {
    href: "https://indiehunt.io",
    src: "https://indiehunt.io/badges/indiehunt-badge-light.svg",
    alt: "Featured on IndieHunt",
  },
  // {
  //   href: "https://startupfa.me/s/pippin?utm_source=getpippin.app",
  //   src: "https://startupfa.me/badges/featured/default.webp",
  //   alt: "Pippin  - Featured on Startup Fame",
  // },
  {
    href: "https://twelve.tools",
    src: "https://twelve.tools/badge1-white.svg",
    alt: "Featured on Twelve Tools",
  },
  // {
  //   href: "https://saasfame.com/item/pippin",
  //   src: "https://saasfame.com/badge-light.svg",
  //   alt: "Featured on saasfame.com",
  // },
  // {
  //   href: "https://auraplusplus.com/projects/pippin-overthinking-journal",
  //   src: "https://auraplusplus.com/images/badges/featured-on-light.svg",
  //   alt: "Featured on Aura++",
  // },
  {
    href: "https://wired.business",
    src: "https://wired.business/badge1-white.svg",
    alt: "Featured on Wired Business",
  },
  {
    href: "https://dofollow.tools",
    src: "https://dofollow.tools/badge/badge_light.svg",
    alt: "Featured on Dofollow.Tools",
  },
  {
    href: "https://www.showmysites.com",
    src: "https://www.showmysites.com/static/backlink/blue_border.webp",
    alt: "Featured on ShowMySites",
  },
  // {
  //   href: "https://www.activesearchresults.com",
  //   src: "",
  //   alt: "",
  // },
  // {
  //   href: "https://ufind.best/products/pippin-overthinking-journal?utm_source=ufind.best",
  //   src: "https://ufind.best/badges/ufind-best-badge-light.svg",
  //   alt: "Featured on ufind.best",
  // },
  {
    href: "https://goodaitools.com",
    src: "https://goodaitools.com/assets/images/badge.png",
    alt: "Featured on goodaitools.com",
  },
];

export function BadgeMarquee() {
  // Duplicate badges for seamless loop
  const duplicatedBadges = [...badges, ...badges];

  return (
    <div className="mt-5 w-full overflow-hidden">
      <motion.div
        className="flex gap-4 md:gap-6"
        animate={{ x: [0, -2000] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        style={{ whiteSpace: "nowrap", display: "flex" }}
      >
        {duplicatedBadges.map((badge, index) => (
          <a
            key={index}
            href={badge.href}
            target="_blank"
            rel={
              badge.href.includes("dofollow.tools")
                ? "noopener"
                : "noopener noreferrer"
            }
            className="flex-shrink-0"
          >
            <img
              src={badge.src}
              alt={badge.alt}
              style={{ height: "35px", width: "auto" }}
              loading="lazy"
            />
          </a>
        ))}
      </motion.div>
    </div>
  );
}
