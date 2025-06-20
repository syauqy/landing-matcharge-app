import { useEffect } from "react";
import Router from "next/router";
import { App } from "@capacitor/app";
import { supabase } from "@/utils/supabaseClient";
import { closeBrowser } from "@/utils/native-browser";

export const DeepLinkHandler = () => {
  const router = Router;
  useEffect(() => {
    App.addListener("appUrlOpen", (_event) => {
      // We get the access_token and potentially the refresh_token from the url:
      const url = new URL(_event.url);
      const params = url.hash
        ?.substring(1)
        ?.split("&")
        ?.reduce((acc, s) => {
          acc[s.split("=")[0]] = s.split("=")[1];
          return acc;
        }, {});

      const access_token = params?.["access_token"] ?? "";
      const refresh_token = params?.["refresh_token"] ?? "";

      // Only sign in if we got an accessToken with this request
      if (access_token) {
        supabase.auth.setSession({ access_token, refresh_token });
      }

      // Dive deep into the app if we have a specific place we were told to go:
      const slug = url.pathname;
      console.log("Redirected to ", slug, "with ", url);
      router.push(slug);
    });
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          closeBrowser().catch(() => {
            // nom nom nom
          });
        }
      }
    );

    // Cleanup the listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return null;
};
