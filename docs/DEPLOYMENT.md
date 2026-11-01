# 部署文档 · DEPLOYMENT.md

> 本项目构建产物**不发起任何外网请求**（零 CDN），支持从公网 VPS 到完全离线内网的全场景部署。

## 0. 在线预览地址（已部署）

| 环境 | 地址 | 说明 |
|------|------|------|
| **GitHub Pages（正式）** | https://zei007.github.io/county-chronicles/ | 推送 main 自动构建发布，静态模式（排行榜/云同步自动降级离线） |
| 本地开发预览 | http://localhost:3000 | `npm run dev` |

> 静态模式下玩家数据存浏览器 localStorage（单机完整体验：探索/经营/挑战/成就全可用）。
> 需要云排行榜：Vercel 导入或自托管（见下），API 路由即用。

## 1. GitHub Pages（已配置 · 全自动）

仓库内置 `.github/workflows/pages.yml`，**每次 push 到 main 自动**：暂移 API 路由 → `STATIC_EXPORT=1` 静态导出 → 发布到 Pages。无需任何手动操作。

手动触发：GitHub 仓库页 → Actions → Pages → Run workflow。

首次在新仓库启用 Pages：仓库 Settings → Pages → Source 选 **GitHub Actions**；
或 `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`。

## 2. Vercel（两键导入 · 功能全）

1. 打开 [vercel.com/new](https://vercel.com/new)，用 GitHub 账号登录
2. Import 本仓库 → 框架自动识别 Next.js → **Deploy**（零配置）
3. 之后 push 自动部署；PR 自动出预览链接
4. API 路由生效，但 Vercel Serverless 文件系统只读——排行榜提交返回 503 优雅降级；云排行榜需接 Vercel KV 或自托管

## 3. 标准部署（Node 进程 / 自托管 · 排行榜完整可用）

```bash
# 开发机
npm install
npm run build

# 生产机（拷贝整个目录后）
npm run start -- -p 3000        # 或 PORT=3000 npm run start
```

### 常驻运行

**Windows（NSSM 示例）**

```powershell
nssm install CountyGame "C:\Program Files\nodejs\node.exe" "node_modules\next\dist\bin\next start -p 3000"
nssm set CountyGame AppDirectory D:\county-chronicles
nssm start CountyGame
```

**Linux（systemd）**

```ini
# /etc/systemd/system/county-chronicles.service
[Unit]
Description=County Chronicles 县城兴衰史
After=network.target

[Service]
WorkingDirectory=/opt/county-chronicles
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable --now county-chronicles
```

## 4. standalone 模式（最小体积部署）

`next.config.ts` 默认 `output: "standalone"`：

```bash
npm run build
# 产物: .next/standalone/ （内含精简 node_modules）
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
node .next/standalone/server.js   # 默认 3000
```

> 注意：standalone 下的 API 文件存储目录 `data-store/` 相对于启动时 cwd，建议固定 `WORKDIR` 后再启动。

## 5. Docker

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t county-chronicles .
docker run -d -p 3000:3000 -v county-data:/app/data-store county-chronicles
```

## 6. Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name game.example.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    # 本地 GeoJSON 长缓存
    location /geo/ {
        proxy_pass http://127.0.0.1:3000/geo/;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

## 7. 完全离线内网部署清单

1. 在有网机器 `npm install && npm run build`
2. 打包传输（二选一）：
   - 整目录：`county-chronicles/`（含 node_modules、.next）
   - standalone：`.next/standalone/ + public/ + .next/static/`（体积最小）
3. 目标机只需 Node.js，无需 npm install
4. 校验离线性：浏览器 DevTools Network 面板应**无任何外部域名请求**
5. 可选：内网排行榜服务即本应用自带（`/api/leaderboard`），数据落在 `data-store/leaderboard.json`

## 8. 任意静态托管（OSS / Nginx 静态 / 内网 IIS）

项目内置静态导出模式（与 Pages 同一套机制）：

```bash
# 1. 暂移 API 路由（静态导出不支持）
mv src/app/api /tmp/api-backup

# 2. 带子路径导出（部署在域名根路径时 NEXT_PUBLIC_BASE_PATH 留空）
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/county-chronicles npm run build

# 3. 产物 out/ 整目录上传任意静态托管；完成后还原 API 目录
```

## 9. 数据备份

```bash
# 排行榜 + 云进度全部在这两个文件
data-store/leaderboard.json
data-store/progress.json
# 备份 = 复制；恢复 = 放回原位
```

## 10. 常见问题

| 现象 | 处理 |
|------|------|
| 首页地图空白 | 确认 `public/geo/china.json` 存在（469KB）；检查响应 200 |
| API 404 | 使用了静态导出（STATIC_EXPORT=1）或未 `npm run build` |
| 排行榜提交失败提示"离线模式" | API 不可达（Pages/静态托管/Vercel 只读盘），玩法不受影响 |
| Pages 上资源 404 | 确认部署时注入了 `NEXT_PUBLIC_BASE_PATH=/county-chronicles`（workflow 已内置） |
| 端口占用 | `npm run start -- -p 8080` 换端口 |
| Windows 控制台中文乱码 | `chcp 65001` 后再启动 |

## 11. 健康检查

```bash
curl http://localhost:3000/            # 200 首页
curl http://localhost:3000/api/leaderboard   # {"entries":[...]}
curl http://localhost:3000/geo/china.json    # 200 JSON
```
