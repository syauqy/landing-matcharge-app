import "@/styles/globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import { AppUrlListener } from "@/context/AppUrlListener";
import Layout from "@/components/layout";

export default function MyApp({ Component, pageProps }) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div>Loading...</div>; // Show loading state while auth is loading
  }

  return (
    <AuthProvider>
      <Layout>
        <AppUrlListener></AppUrlListener>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
