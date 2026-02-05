import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
