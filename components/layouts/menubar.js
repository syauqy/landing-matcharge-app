import React from "react";
import Link from "next/link";
import {
  HomeIcon,
  UserCircleIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { CrystalBall } from "@/components/icons";
import clsx from "clsx";

export function Menubar({ page }) {
  return (
    <div class="dock dock-md border-batik-border">
      <Link
        href="/home"
        className={clsx(
          page === "home" && "dock-active font-bold",
          "text-batik-text flex flex-col items-center"
        )}
      >
        <HomeIcon className="h-6 w-6" />
        <span className="dock-label">Home</span>
      </Link>
      <Link
        href="/readings"
        className={clsx(
          page === "readings" && "dock-active font-bold",
          "text-batik-text flex flex-col items-center"
        )}
      >
        <CrystalBall className="h-6 w-6" />
        <span className="dock-label">Readings</span>
      </Link>
      <Link
        href="/profile"
        className={clsx(
          page === "profile" && "dock-active font-bold",
          "text-batik-text flex flex-col items-center"
        )}
      >
        <UserCircleIcon className="h-6 w-6" />
        <span className="dock-label">Profile</span>
      </Link>
    </div>
  );
}
