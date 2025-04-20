import React from "react";
import { App } from "@capacitor/app";
import { useEffect } from "react";
// import Router from "next/router";

export function AppUrlListener() {
  // const router = Router;

  useEffect(() => {
    App.addListener("appUrlOpen", (event) => {
      // --- Import supabase INSIDE the listener ---
      const { supabase } = require("@/utils/supabaseClient");
      // --- Log immediately after import ---
      console.log(
        "AppUrlListener: Supabase object imported inside listener:",
        typeof supabase
      );

      console.log("AppUrlListener: Received event:", event);
      console.log("AppUrlListener: Full URL from event:", event.url);
      console.log(
        "AppUrlListener: Current window.location.hash:",
        window.location.hash
      );

      const url = new URL(event.url);
      const hash = url.hash;

      if (hash) {
        console.log("AppUrlListener: Found fragment:", hash);

        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        console.log("AppUrlListener: Parsed access_token:", !!accessToken);
        console.log("AppUrlListener: Parsed refresh_token:", !!refreshToken);

        if (accessToken && refreshToken) {
          // --- Verification log (should now work if import succeeded) ---
          console.log(
            "AppUrlListener: Verifying supabase object before setSession:",
            typeof supabase?.auth?.setSession === "function"
              ? "supabase.auth.setSession exists"
              : "supabase.auth.setSession NOT FOUND or invalid"
          );
          // --- End verification log ---

          if (supabase?.auth?.setSession) {
            console.log(
              "AppUrlListener: Attempting to set session manually..."
            );
            supabase.auth
              .setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              .then(({ data, error }) => {
                if (error) {
                  console.error(
                    "AppUrlListener: Error returned by setSession:",
                    error
                  );
                } else {
                  console.log(
                    "AppUrlListener: Session set manually successfully:",
                    data.session
                  );
                }
              })
              .catch((err) => {
                console.error(
                  "AppUrlListener: CATCH block: Exception during setSession:",
                  err
                );
                if (err instanceof Error) {
                  console.error("AppUrlListener: Error name:", err.name);
                  console.error("AppUrlListener: Error message:", err.message);
                  console.error("AppUrlListener: Error stack:", err.stack);
                }
              });
          } else {
            console.error(
              "AppUrlListener: Cannot call setSession - supabase object or auth method is invalid (imported inside listener)."
            );
          }
        } else {
          console.warn(
            "AppUrlListener: Could not find access_token or refresh_token in fragment."
          );
        }
      } else {
        console.log("AppUrlListener: No fragment found in URL.");
      }

      // const slug = event.url.split("wetonai.vercel.app").pop();
      // console.log("App URL Opened:", slug);
      // if (slug) router.push(slug);
    });
  }, []);
  return <></>;
}
