import { Capacitor } from "@capacitor/core";

export const config = {
  api: {
    url: Capacitor.isNativePlatform()
      ? process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_HOST
        : "http://localhost:3000"
      : "/api",
    // Timeout for API requests in milliseconds
    timeout: 10000,
  },
};
