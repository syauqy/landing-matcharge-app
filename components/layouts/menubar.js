import React from "react";
import Link from "next/link";
import {
  HomeIcon,
  UserCircleIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { CrystalBall } from "@/components/icons";

export function Menubar() {
  return (
    <nav className="bg-batik w-full px-4 py-1.5 fixed bottom-0 left-0 inset-shadow-2xs border-t border-batik-border z-50">
      <ul className="flex justify-around">
        <li>
          <Link
            href="/dashboard"
            className="text-batik-text flex flex-col items-center"
          >
            <HomeIcon className="h-6 w-6" />
            <span className="mt-0.5 text-xs font-medium">Home</span>
          </Link>
        </li>
        <li>
          <Link
            href="/love"
            className="text-batik-text flex flex-col items-center"
          >
            <HeartIcon className="h-6 w-6 stroke-[1.5]" />
            <span className="mt-0.5 text-xs font-medium">Compatibility</span>
          </Link>
        </li>

        <li>
          <Link
            href="/readings"
            className="text-batik-text flex flex-col items-center"
          >
            <CrystalBall className="h-6 w-6" />
            <span className="mt-0.5 text-xs font-medium">Readings</span>
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            className="text-batik-text flex flex-col items-center"
          >
            <UserCircleIcon className="h-6 w-6" />
            <span className="mt-0.5 text-xs font-medium">Profile</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
