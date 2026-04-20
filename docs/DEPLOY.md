# Lizo 部署指南

> 前端 → Vercel｜后端 → 树莓派 + Cloudflare Tunnel

---

## 当前状态

| 模块 | 状态 | 位置 |
|------|------|------|
| React 前端 | ✅ 已完成，待部署 | `frontend/` |
| Flask 后端 + API | ✅ 已完成，待启动 | `lizo/src/web/server.py` |
| Arduino 固件 | ✅ 已有 | `lizo_v4/` |
| Vercel 部署 | ⏳ 待操作 | — |
| Cloudflare Tunnel | ⏳ 待操作 | 树莓派上 |

---

## Part 1：树莓派准备

### 1.1 填写 API Key

编辑 `lizo/config.yaml`：

```yaml
ai:
  api_key: "YOUR_OPENROUTER_KEY_HERE"   # ← 换成真实 Key
                                         # 去 https://openrouter.ai 注册拿
```

### 1.2 安装 Python 依赖

```bash
cd lizo
pip3 install -r requirements.txt
```

### 1.3 安装 Cloudflare Tunnel（让外网能访问树莓派）

```bash
# 下载（树莓派 ARM64）
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 \
  -o ~/cloudflared
chmod +x ~/cloudflared

# 登录（会打开浏览器，扫码或点链接）
~/cloudflared tunnel login

# 建隧道
~/cloudflared tunnel create lizo
```

### 1.4 启动后端

```bash
# 终端 1：启动 Flask
cd lizo
python3 -m src.main --web-only

# 终端 2：启动 Cloudflare Tunnel
~/cloudflared tunnel --url http://localhost:5000
```

Tunnel 启动后会打印一个地址，**记下来**，例如：
```
https://lizo-random-words.trycloudflare.com
```

### 1.5 验证后端可访问

```bash
curl https://lizo-random-words.trycloudflare.com/api/v1/status
# 期望返回：{"data":{"hardware":false,"online":true},"status":"success"}
```

---

## Part 2：前端部署到 Vercel

### 2.1 填写生产环境变量

在 `frontend/` 目录创建 `.env.production` 文件：

```bash
# frontend/.env.production
VITE_API_BASE_URL=https://lizo-random-words.trycloudflare.com
```

> ⚠️ 把地址换成你 1.4 步拿到的真实 Tunnel 地址

### 2.2 部署到 Vercel

```bash
# 安装 Vercel CLI（只需一次）
npm install -g vercel

# 登录
vercel login

# 在 frontend/ 目录部署
cd frontend
vercel --prod
```

Vercel 会问几个问题：
- **Set up and deploy?** → `Y`
- **Which scope?** → 选你的账号
- **Link to existing project?** → `N`（第一次）
- **Project name?** → `lizo`（或任意名字）
- **Directory?** → `./`（当前在 frontend/ 里）
- **Override settings?** → `N`

部署完成后会给你一个域名，**记下来**，例如：
```
https://lizo.vercel.app
```

### 2.3 在 Vercel 控制台设环境变量

> 因为 `.env.production` 不会上传到 Vercel，需要在控制台手动设

1. 打开 [vercel.com](https://vercel.com) → 你的项目 → **Settings → Environment Variables**
2. 添加：

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_BASE_URL` | `https://lizo-random-words.trycloudflare.com` | ✅ Production |

3. 保存后点 **Deployments → 最新一次 → Redeploy**

---

## Part 3：配置 CORS

回到树莓派，编辑 `lizo/config.yaml`：

```yaml
web:
  cors_origins: "https://lizo.vercel.app,http://localhost:5173"
  #              ↑ 换成你的 Vercel 域名
```

重启 Flask：

```bash
# Ctrl+C 停掉原来的，然后重新跑
python3 -m src.main --web-only
```

也可以不改 `config.yaml`，直接在启动时用环境变量覆盖：

```bash
cd lizo
LIZO_CORS_ORIGINS="https://lizo.vercel.app,http://localhost:5173" python3 -m src.main --web-only
```

---

## Part 4：验证全链路

```bash
# 1. 打开浏览器访问 Vercel 域名
open https://lizo.vercel.app

# 2. 进入 /chat 页面，发一条消息
# 期望：Lizo 有回复

# 3. 进入 /soul 页面
# 期望：情绪图和日记正常加载（可能是空数据，这是正常的）
```

---

## 常见问题

**Q：Tunnel 地址每次重启都变怎么办？**
有两个方案：
- 在 Cloudflare 控制台绑定自定义域名（免费，永久固定）
- 或者用 `cloudflared tunnel route dns lizo your-domain.com` 绑你自己的域名

**Q：前端报 CORS 错误？**
检查 `config.yaml` 的 `cors_origins` 是否精确匹配 Vercel 域名（包括 `https://`，不要有尾部斜杠）

**Q：`/chat` 发消息没反应？**
先用 `curl` 测后端是否还活着：
```bash
curl https://你的tunnel地址/api/v1/status
```

**Q：想用 Arduino 硬件模式？**
把 `--web-only` 去掉，用 `--text` 调试模式先测：
```bash
python3 -m src.main --text
```

---

## 本地开发（不需要树莓派）

```bash
# 终端 1：启动前端
cd frontend
npm run dev

# 终端 2：用最简单的方式跑后端（需要设 api_key）
cd lizo
python3 -m src.main --web-only

# 前端访问 http://localhost:5173
# Vite 会自动把 /api 请求代理到 localhost:5000
```
