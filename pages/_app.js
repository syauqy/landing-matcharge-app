import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

import { DeepLinkHandler } from "@/context/DeepLinkHandler";
import { useEffect } from "react";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    function handleTouchStart(event) {
      if (event.target.tagName === "A") {
        event.preventDefault();
      }
    }
    document.addEventListener("touchstart", handleTouchStart);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);
  return (
    <AuthProvider>
      {/* <AppUrlListener></AppUrlListener> */}
      <DeepLinkHandler />
      {/* <DebugComponent /> */}
      <NuqsAdapter>
        <Component {...pageProps} />
      </NuqsAdapter>
    </AuthProvider>
  );
}
