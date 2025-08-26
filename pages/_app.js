import "@/styles/globals.css";
// import { AuthProvider } from "@/context/AuthContext";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
// import { AppUrlListener } from "@/context/AppUrlListener";
// import { NewAppUrlListener } from "@/context/NewAppUrlListener";
import { useEffect } from "react";
// import SplashScreen from "@/components/illustrations/splash-screen";
// import { useSplashScreen } from "@/utils/useSplashScreen";
// import { Posthog } from "@capawesome/capacitor-posthog";
// import { PostHogPageview } from "@/components/PostHogPageview";
// import { SplashScreen as CapacitorSplashScreen } from "@capacitor/splash-screen";
// import { Capacitor } from "@capacitor/core";

export default function MyApp({ Component, pageProps }) {
  // const { showSplash } = useSplashScreen();

  // useEffect(() => {
  //   function handleTouchStart(event) {
  //     if (event.target.tagName === "A") {
  //       event.preventDefault();
  //     }
  //   }
  //   document.addEventListener("touchstart", handleTouchStart);
  //   return () => {
  //     document.removeEventListener("touchstart", handleTouchStart);
  //   };
  // }, []);
  return (
    // <AuthProvider>
    //   {/* <PostHogPageview /> */}
    //   {/* <AppUrlListener></AppUrlListener> */}
    //   {/* <NewAppUrlListener /> */}

    //   {/* <DeepLinkHandler /> */}
    //   {/* <DebugComponent /> */}

    // </AuthProvider>
    <NuqsAdapter>
      {/* {showSplash && <SplashScreen />} */}
      <Component {...pageProps} />
    </NuqsAdapter>
  );
}
