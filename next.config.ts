import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Add empty turbopack config to silence the warning
  turbopack: {},
  
  // Ensure webpack resolves path aliases correctly for Netlify
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
