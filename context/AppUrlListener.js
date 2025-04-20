import React from "react";
import { App } from "@capacitor/app";
import { useEffect } from "react";
import Router from "next/router";

export function AppUrlListener() {
  const router = Router;

  useEffect(() => {
    App.addListener("appUrlOpen", (event) => {
      console.log("App opened with URL:", url); // Log the full URL object or string
      console.log("URL fragment:", url?.hash || window.location.hash); // Specifically log the fragment
      // Check if the URL string contains a '#' symbol
      const hasHash = event.url.includes("#");
      console.log("AppUrlListener: Does URL contain fragment (#)?", hasHash);
      if (hasHash) {
        // Log the part after the # if it exists
        console.log("AppUrlListener: Fragment:", event.url.split("#")[1]);
      }

      const slug = event.url.split("wetonai.vercel.app").pop();
      console.log("App URL Opened:", slug);
      if (slug) router.push(slug);
    });
  }, []);
  return <></>;
}
