import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["cdn.morpho.org"], // Add allowed external domains here
  },
};

export default nextConfig;
