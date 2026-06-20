import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set the monorepo root so Turbopack doesn't warn about multiple lockfiles
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      // Proxy all /api/* calls to the Express backend on port 5000
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
