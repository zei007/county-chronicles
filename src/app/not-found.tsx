import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-5xl">🏚️</div>
      <h1 className="title-font text-xl font-bold text-amber-200">这座城市不在地图上</h1>
      <p className="max-w-sm text-sm text-muted-foreground">你要找的页面不存在，或者这座城市尚未收录。回到中国地图重新选择吧。</p>
      <Link href="/" className="btn-gold rounded-lg px-5 py-2.5 text-sm font-medium">返回首页</Link>
    </div>
  );
}
