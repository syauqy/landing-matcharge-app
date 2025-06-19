import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

import { AppUrlListener } from "@/context/AppUrlListener";
import { DeepLinkHandler } from "@/context/DeepLinkHandler";
import { DebugComponent } from "@/context/DebugComponent";
import Layout from "@/components/layout";

export default function MyApp({ Component, pageProps }) {
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
