import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { Abhaya_Libre } from "next/font/google";
import clsx from "clsx";
import { motion } from "framer-motion";

const abhaya = Abhaya_Libre({
  weight: "800",
  subsets: ["latin"],
});

export default function PageRouter() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const handleRedirect = (path) => {
      setIsExiting(true);
      setTimeout(() => {
        router.replace(path);
      }, 500); // Duration of the fade-out animation
    };

    const checkUserAndProfile = async () => {
      if (!user) {
        handleRedirect("/");
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, birth_date")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        const destination =
          profile && profile.birth_date ? "/home" : "/profile-setup";
        handleRedirect(destination);
      } catch (err) {
        console.error("Error checking profile, redirecting to login:", err);
        handleRedirect("/");
      }
    };

    checkUserAndProfile();
  }, [user, authLoading, router]);

  return (
    <motion.div
      className="relative flex h-[100svh] w-screen flex-col items-center justify-center bg-cover bg-center bg-gradient-to-t from-batik to-base-100 to-85%"
      style={{ backgroundImage: "url('/splash-background.jpg')" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
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
    </motion.div>
  );
}
