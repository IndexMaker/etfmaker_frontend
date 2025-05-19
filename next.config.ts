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
        source: '/:path*',
        destination: 'http://3.75.48.179/:path*',
      },
    ];
  },
};

export default nextConfig;
