import type { NextConfig } from "next";

/**
 * 双模式构建：
 * - 默认：standalone 服务器部署（API 路由可用：排行榜/云同步，文件存储）
 * - STATIC_EXPORT=1：GitHub Pages 静态导出（API 路由已由 CI 暂移，
 *   NEXT_PUBLIC_BASE_PATH 注入部署子路径，如 /county-chronicles）
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // 全资源本地化：关闭对 CDN 的任何隐式依赖；字体使用系统栈（见 globals.css）
  reactStrictMode: true,
  ...(isStaticExport ? { output: "export" as const, basePath, trailingSlash: true } : { output: "standalone" as const }),
  eslint: { ignoreDuringBuilds: true },
  // 静态导出不支持 headers 配置
  ...(isStaticExport
    ? {}
    : {
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
      }),
};

export default nextConfig;
