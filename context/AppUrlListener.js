import React from "react";
import { App } from "@capacitor/app";
import { useEffect } from "react";
// import Router from "next/router";

export function AppUrlListener() {
  // const router = Router;

  useEffect(() => {
    App.addListener("appUrlOpen", (event) => {
      console.log("AppUrlListener: Received event:", event);
      console.log("AppUrlListener: Full URL from event:", event.url);

      // --- Add this log ---
      // Check what the web view's window object thinks the hash is right now
      console.log(
        "AppUrlListener: Current window.location.hash:",
        window.location.hash
      );
      // --- End of added log ---

      const hasHash = event.url.includes("#");
      console.log(
        "AppUrlListener: Does event.url contain fragment (#)?",
        hasHash
      );

      if (hasHash) {
        console.log(
          "AppUrlListener: Fragment from event.url:",
          event.url.split("#")[1]
        );
      }

      // const slug = event.url.split("wetonai.vercel.app").pop();
      // console.log("App URL Opened:", slug);
      // if (slug) router.push(slug);
    });
  }, []);
  return <></>;
}
