import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "县城兴衰史 · County Rise & Fall",
  description:
    "数据驱动的中国资源型城市兴衰互动叙事 + 模拟经营游戏：时间轴探索、产业链拼图、衰落诊断、县长生涯模拟。全部资源本地化，可离线部署。",
  applicationName: "县城兴衰史",
  keywords: ["资源型城市", "县城", "模拟经营", "数据可视化", "收缩城市", "转型"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#15161c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-dvh antialiased">
        {children}
        <Toaster position="top-center" theme="dark" richColors />
      </body>
    </html>
  );
}
