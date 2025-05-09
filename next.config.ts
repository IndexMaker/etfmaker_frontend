import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.morpho.org", "www.countryflags.io", 'coin-images.coingecko.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/:path*", // Proxy to NestJS backend
      },
    ];
  },
};

export default nextConfig;
