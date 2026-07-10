import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  optimizeFonts: false,
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: '/__firebase_storage/:path*',
        destination: 'https://firebasestorage.googleapis.com/v0/b/:path*',
      },
    ];
  },
};

export default nextConfig;
