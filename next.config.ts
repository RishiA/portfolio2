import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io"
      }
    ]
  },
  async redirects() {
    return [
      {
        source: "/Resume",
        destination: "/Resume/Resume.pdf",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
