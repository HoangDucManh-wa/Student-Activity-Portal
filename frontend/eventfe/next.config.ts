import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/organization/event-registration",
        destination: "/organization/event",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
