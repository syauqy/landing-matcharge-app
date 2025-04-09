import React from "react";
import { App } from "@capacitor/app";
import { useEffect } from "react";
import Router from "next/router";

export function AppUrlListener() {
  const router = Router;
  useEffect(() => {
    App.addListener("appUrlOpen", (event) => {
      const slug = event.url.split(".app").pop();
      if (slug) router.push(slug);
    });
  }, []);
  return <></>;
}
