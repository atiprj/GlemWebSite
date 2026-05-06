import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  // Prevent Turbopack / NFT from bundling the heavy media assets folder into
  // every serverless function. The files are still served as static assets by
  // Vercel's CDN — server functions only need the pre-built JSON manifest.
  outputFileTracingExcludes: {
    "**/*": [
      "./public/assets/03.Project/**/*",
      "./public/assets/03.Projects/**/*"
    ]
  }
};

export default nextConfig;
