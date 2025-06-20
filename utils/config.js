import { Capacitor } from "@capacitor/core";

export const config = {
  api: {
    url: Capacitor.isNativePlatform()
      ? process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_HOST + "/api"
        : process.env.NEXT_PUBLIC_HOST + "/api"
      : "/api",
    // Timeout for API requests in milliseconds
    timeout: 10000,
  },
};

export const configExtended = {
  api: {
    url: Capacitor.isNativePlatform()
      ? process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_HOST + "/api"
        : "http://localhost:3000/api"
      : "/api",
    // Timeout for API requests in milliseconds
    timeout: 10000,
  },
};
