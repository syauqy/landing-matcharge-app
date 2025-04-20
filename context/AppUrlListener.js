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
      console.log(
        "AppUrlListener: Current window.location.hash:",
        window.location.hash // Still useful for confirming it's empty
      );

      const url = new URL(event.url);
      const hash = url.hash; // Get the fragment part (e.g., #access_token=...)

      if (hash) {
        console.log("AppUrlListener: Found fragment:", hash);

        // Parse the fragment parameters into an object
        const params = new URLSearchParams(hash.substring(1)); // Remove the leading '#'
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const expiresIn = params.get("expires_in"); // Optional, but good to have

        console.log("AppUrlListener: Parsed access_token:", !!accessToken); // Log if token exists
        console.log("AppUrlListener: Parsed refresh_token:", !!refreshToken); // Log if token exists

        // --- Manually set the session ---
        if (accessToken && refreshToken) {
          console.log("AppUrlListener: Attempting to set session manually...");
          supabase.auth
            .setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            .then(({ data, error }) => {
              if (error) {
                console.error(
                  "AppUrlListener: Error setting session manually:",
                  error
                );
              } else {
                console.log(
                  "AppUrlListener: Session set manually successfully:",
                  data.session // Log the session object if successful
                );
                // The onAuthStateChange listener in AuthContext should now fire with SIGNED_IN
              }
            })
            .catch((err) => {
              console.error(
                "AppUrlListener: Exception during setSession:",
                err
              );
            });
        } else {
          console.warn(
            "AppUrlListener: Could not find access_token or refresh_token in fragment."
          );
        }
        // --- End of manual session setting ---
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
