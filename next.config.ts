import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["cdn.morpho.org", 'www.countryflags.io'], // Add allowed external domains here
  },
};

export default nextConfig;
