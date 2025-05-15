import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      jotai: path.resolve(__dirname, "node_modules/jotai"),
      "jotai-x": path.resolve(__dirname, "node_modules/jotai-x"),
      "jotai-optics": path.resolve(__dirname, "node_modules/jotai-optics"),
    };
    return config;
  },
};

export default nextConfig;
