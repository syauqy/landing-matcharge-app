import React from "react";
import { App } from "@capacitor/app";
import { useEffect } from "react";
import Router from "next/router";

export function AppUrlListener() {
  const router = Router;
  useEffect(() => {
    App.addListener("appUrlOpen", (event) => {
      const slug = event.url.split("wetonai.vercel.app").pop();
      console.log("App URL Opened:", slug);
      if (slug) router.push(slug);
    });
  }, []);
  return <></>;
}
