import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { AppUrlListener } from "@/context/AppUrlListener";
import { NewAppUrlListener } from "@/context/NewAppUrlListener";
// import { DeepLinkHandler } from "@/context/DeepLinkHandler";
import { useEffect } from "react";
import SplashScreen from "@/components/illustrations/splash-screen";
import { useSplashScreen } from "@/utils/useSplashScreen";

export default function MyApp({ Component, pageProps }) {
  const { showSplash } = useSplashScreen();
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
      <NewAppUrlListener />

      {/* <DeepLinkHandler /> */}
      {/* <DebugComponent /> */}
      <NuqsAdapter>
        {showSplash && <SplashScreen />}
        <Component {...pageProps} />
      </NuqsAdapter>
    </AuthProvider>
  );
}
