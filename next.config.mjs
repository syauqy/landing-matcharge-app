/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "local-origin.dev",
    "*.local-origin.dev",
    "http://192.168.1.2",
  ],
};

export default nextConfig;
