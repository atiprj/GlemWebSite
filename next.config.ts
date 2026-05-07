import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 960, 1280, 1680, 1920],
    imageSizes: [16, 32, 64, 128, 256]
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
