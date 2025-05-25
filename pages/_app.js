import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";

import { AppUrlListener } from "@/context/AppUrlListener";
import Layout from "@/components/layout";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppUrlListener></AppUrlListener>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
