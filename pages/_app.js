import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";

import { AppUrlListener } from "@/context/AppUrlListener";
import Layout from "@/components/layout";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        {/* <AppUrlListener></AppUrlListener> */}
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
