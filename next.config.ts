import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.dexscreener.com',
      },
      {
        protocol: 'https',
        hostname: 'image.dexscreener.com',
      },
    ],
  },
};

export default nextConfig;
