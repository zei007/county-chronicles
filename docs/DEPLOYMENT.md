# 部署文档 · DEPLOYMENT.md

> 本项目构建产物**不发起任何外网请求**（零 CDN），支持从公网 VPS 到完全离线内网的全场景部署。

## 0. 环境要求

- Node.js ≥ 18.17（推荐 20 LTS 或 22/26；验证环境 Node 26）
- 无需数据库、无需外网（构建时 npm install 一次即可，可用离线 npm 缓存）

## 1. 标准部署（Node 进程）

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
nssm set CountyGame AppDirectory D:\county-game
nssm start CountyGame
```

**Linux（systemd）**

```ini
# /etc/systemd/system/county-game.service
[Unit]
Description=County Rise & Fall
After=network.target

[Service]
WorkingDirectory=/opt/county-game
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable --now county-game
```

## 2. standalone 模式（最小体积部署）

`next.config.ts` 已启用 `output: "standalone"`：

```bash
npm run build
# 产物: .next/standalone/ （内含精简 node_modules）
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
node .next/standalone/server.js   # 默认 3000
```

> 注意：standalone 下的 API 文件存储目录 `data-store/` 相对于启动时 cwd，建议固定 `WORKDIR` 后再启动。

## 3. Docker

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
docker build -t county-game .
docker run -d -p 3000:3000 -v county-data:/app/data-store county-game
```

## 4. Nginx 反向代理（可选）

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

## 5. 完全离线内网部署清单

1. 在有网机器 `npm install && npm run build`
2. 打包传输（二选一）：
   - 整目录：`county-game/`（含 node_modules、.next）
   - standalone：`.next/standalone/ + public/ + .next/static/`（体积最小）
3. 目标机只需 Node.js，无需 npm install
4. 校验离线性：浏览器 DevTools Network 面板应**无任何外部域名请求**；或 `Get-Content .next/**/*.html | Select-String "http"` 无外链
5. 可选：内网排行榜服务即本应用自带（`/api/leaderboard`），数据落在 `data-store/leaderboard.json`

## 6. 静态托管（GitHub Pages / OSS / Nginx 静态）

排行榜与云进度需要 Node 运行时。若只要静态玩法：

```bash
# 方案A: 直接部署 export 产物（本作页面全 SSG）
npm run build
# 把 .next/server/app 中的 HTML 不可直接用；推荐方案B
```

```bash
# 方案B（推荐）: 用 npx serve 托管 standalone 的 public + 预渲染页
# 或改造 next.config.ts 添加 output: "export" 后 npm run build → out/
# 注意: output: "export" 会禁用 API 路由（排行榜按钮将静默降级为"离线模式"）
```

## 7. 数据备份

```bash
# 排行榜 + 云进度全部在这两个文件
data-store/leaderboard.json
data-store/progress.json
# 备份 = 复制；恢复 = 放回原位
```

## 8. 常见问题

| 现象 | 处理 |
|------|------|
| 首页地图空白 | 确认 `public/geo/china.json` 存在（582KB）；检查响应 200 |
| API 404 | 使用了静态导出（output: "export"）或未 `npm run build` |
| 排行榜提交失败提示"离线模式" | API 不可达（静态托管/网络策略），玩法不受影响 |
| 端口占用 | `npm run start -- -p 8080` 换端口 |
| Windows 控制台中文乱码 | `chcp 65001` 后再启动 |

## 9. 健康检查

```bash
curl http://localhost:3000/            # 200 首页
curl http://localhost:3000/api/leaderboard   # {"entries":[...]}
curl http://localhost:3000/geo/china.json    # 200 JSON
```
