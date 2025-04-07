import React from "react";
import { App } from "@capacitor/app";
import { useEffect } from "react";

export function AppUrlListener() {
  useEffect(() => {
    App.addListener("appUrlOpen", (event) => {
      const slug = event.url.split(".app").pop();
      if (slug) window.location.href = slug;
    });
  }, []);
  return <></>;
}
