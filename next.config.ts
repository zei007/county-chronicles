import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 全资源本地化：关闭对 CDN 的任何隐式依赖；字体使用系统栈（见 globals.css）
  reactStrictMode: true,
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: "/geo/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
