import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { Abhaya_Libre } from "next/font/google";
import clsx from "clsx";

const abhaya = Abhaya_Libre({
  weight: "800",
  subsets: ["latin"],
});

export default function PageRouter() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading. The AuthProvider will handle
    // the session from the URL hash after an OAuth redirect.
    if (authLoading) {
      return;
    }

    // If there's no user after loading, they are not logged in.
    // Redirect to the login page.
    if (!user) {
      router.replace("/");
      return;
    }

    // If we have a user, check if they have a profile.
    const checkProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, birth_date") // We only need to know if a profile with a birth_date exists.
          .eq("id", user.id)
          .single();

        // A "PGRST116" error means no rows were found, which is expected for a new user.
        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (profile && profile.birth_date) {
          // Profile exists and is complete, go to the main app.
          router.replace("/home");
        } else {
          // No profile or it's incomplete, go to the setup page.
          router.replace("/profile-setup");
        }
      } catch (err) {
        console.error("Error checking profile, redirecting to login:", err);
        router.replace("/"); // Redirect to login on error
      }
    };

    checkProfile();
  }, [user, authLoading, router]);

  // Display a loading indicator while we determine the user's state.
  return (
    <div
      className="relative flex h-[100svh] w-screen flex-col items-center justify-center bg-cover bg-center bg-gradient-to-t from-batik to-base-100 to-85%"
      style={{ backgroundImage: "url('/splash-background.jpg')" }}
    >
      <div className="absolute inset-0 " />
      <div className="relative z-10 text-center">
        <div className="text-batik-black gap-1 flex flex-col items-center justify-center">
          <p
            className={clsx("text-8xl font-bold leading-12", abhaya.className)}
          >
            Weton
          </p>
          <p
            className={clsx("text-8xl font-bold leading-12", abhaya.className)}
          >
            scope
          </p>
        </div>

        <div className="mt-8">
          <svg
            className="mx-auto h-8 w-8 animate-spin text-rose-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
