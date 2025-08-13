import React from "react";
import { motion } from "framer-motion";
import { Abhaya_Libre } from "next/font/google";
import clsx from "clsx";

const abhaya = Abhaya_Libre({
  weight: "800",
  subsets: ["latin"],
});

const SplashScreen = () => {
  return (
    <motion.div
      className="relative flex h-[100svh] w-screen flex-col items-center justify-center bg-cover bg-center bg-gradient-to-t from-batik to-base-100 to-85% z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 3, delay: 1.5 }}
      style={{
        pointerEvents: "none",
        backgroundImage: "url('/splash-background.jpg')",
      }}
    >
      <div className="absolute inset-0" />
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
};

export default SplashScreen;
