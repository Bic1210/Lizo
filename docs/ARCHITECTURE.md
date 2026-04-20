# Lizo 系统架构文档

## 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户（浏览器）                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│              Lizo Web Platform (Vercel)                  │
│              React 18 + TypeScript + Tailwind            │
│                                                          │
│  /          → 首页 / 品牌展示                             │
│  /soul      → 数字人格空间（日记、情绪图、视频）           │
│  /chat      → 在线体验（文字聊天）                        │
│  /about     → 项目介绍                                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP API (开发时) / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│              Python Flask 后端 (树莓派 / 未来云端)         │
│              lizo/src/web/server.py                      │
│                                                          │
│  /api/v1/chat        → 文字对话（调 OpenRouter）          │
│  /api/v1/diary       → 获取 Lizo 日记列表                │
│  /api/v1/emotion     → 获取情绪历史数据                  │
│  /api/v1/status      → 硬件在线状态                      │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
   ┌──────▼──┐  ┌──────▼──┐  ┌────▼────┐
   │ brain/  │  │ memory/ │  │hardware/│
   │ chat.py │  │database │  │arduino  │
   │emotion  │  │.py      │  │.py      │
   │persona  │  │(SQLite) │  │(Serial) │
   └─────────┘  └─────────┘  └────┬────┘
                                   │ UART
                             ┌─────▼─────┐
                             │ Arduino   │
                             │ lizo_v4/  │
                             │(舵机/LCD/ │
                             │传感器)    │
                             └───────────┘
```

## 前端页面详细设计

### 首页 `/`
```
LizoHero              ← 大图 + 即梦视频 + 一句话介绍
FeatureSection        ← 软硬件分层介绍（软件免费/硬件更多）
VideoShowcase         ← 即梦生成的 Lizo 视频展示
CTASection            ← "在线体验" + "了解硬件版本"
```

### 数字人格空间 `/soul`
```
DiaryList             ← Lizo 的每日日记（从后端获取）
EmotionChart          ← 情绪曲线图（用 recharts）
VideoGallery          ← 即梦视频展示墙
```

### 在线体验 `/chat`
```
LizoAvatar            ← Lizo 形象展示（静态图 + 动效）
ChatWindow            ← 文字聊天界面
  ChatMessage         ← 单条消息气泡
  ChatInput           ← 输入框 + 发送按钮
```

## API 规范

所有 API 返回格式：
```json
{
  "status": "success" | "error",
  "data": {},
  "message": "可选的说明"
}
```

### 已规划端点

| 端点 | 方法 | 描述 | 状态 |
|------|------|------|------|
| `/api/v1/chat` | POST | 文字对话 | 已有（需包装） |
| `/api/v1/diary` | GET | 获取日记列表 | 待实现 |
| `/api/v1/emotion` | GET | 获取情绪数据 | 待实现 |
| `/api/v1/status` | GET | 硬件在线状态 | 待实现 |

### `/api/v1/chat` 请求/响应

```json
// 请求
POST /api/v1/chat
{
  "message": "你好 Lizo",
  "session_id": "optional-uuid"
}

// 响应
{
  "status": "success",
  "data": {
    "reply": "嗨～今天感觉怎么样？",
    "emotion": "happy",
    "session_id": "uuid"
  }
}
```

## 关键技术决策

### 前端路由：React Router v6
理由：标准选择，文档好，支持 lazy loading

### 样式：Tailwind CSS
理由：与 DESIGN.md 变量配合好，无运行时开销

### 图表：Recharts
理由：React 生态，声明式 API，适合情绪曲线图

### 状态管理：React useState + useContext（暂不引入 Redux）
理由：当前规模不需要，避免过度工程

### 前端部署：Vercel
理由：免费，CI/CD 自动，支持自定义域名

### 跨域处理
开发时：Vite 代理（`/api` → `localhost:5000`）  
生产时：树莓派后端开启 CORS，或反向代理

## 软硬件分层策略

```
软件层（全部用户可用）          硬件层（额外体验）
─────────────────────         ─────────────────────
✓ Web 聊天                    ✓ 语音对话（麦克风）
✓ 查看 Lizo 日记               ✓ 物理触摸响应
✓ 情绪曲线图                   ✓ 呼吸/心跳动效
✓ 即梦视频展示                  ✓ 接近检测唤醒
✓ 数字人格展示                  ✓ LCD 表情显示
```

## 部署

### 前端（Vercel）
1. 连接 GitHub repo 到 Vercel
2. Root Directory 设置为 `frontend/`
3. 环境变量设置 `VITE_API_BASE_URL=https://你的树莓派地址`
4. 自动部署：push 到 main 分支触发

### 后端（树莓派）
- 运行 `python -m lizo` 启动 Flask 服务
- 确保 CORS origins 包含 Vercel 分配的域名
- 推荐用 `screen` 或 `systemd` 保持进程
