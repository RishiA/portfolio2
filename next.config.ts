import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Hostnames (not full URLs) allowed to request `/_next/*` in dev; see `isCsrfOriginAllowed` in Next. */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
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
