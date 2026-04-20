# Lizo 🦎

> 一只住在软件里的小蜥蜴。随时在，不会走。

Lizo 是一个 AI 陪伴平台，软件是灵魂的栖息地，硬件是灵魂的物理容器。

---

## 在线体验

部署后地址填这里（Vercel 域名）

---

## 项目结构

```
Lizoallhere/
├── frontend/        # React 19 + TypeScript + Tailwind v4（Web 前端）
├── lizo/            # Python 3.11 + Flask（树莓派后端）
├── lizo_v4/         # Arduino 固件
├── lizo-manager/    # Spring Boot CLI 管理工具
└── docs/            # 设计、架构、任务文档
```

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 · TypeScript · Tailwind CSS v4 · Vite |
| 后端 | Python 3.11 · Flask · SQLite |
| AI | OpenRouter API |
| 硬件 | 树莓派 4B · Arduino · 触摸/接近传感器 |
| 部署 | Vercel（前端）· 树莓派（后端）|

---

## 本地开发

**前端**
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

**后端**
```bash
cd lizo
pip install -r requirements.txt
python src/main.py
```

---

## 功能

- 💬 在线陪伴聊天，Lizo 有情绪、有记忆
- 🌙 白天 / 夜间双主题
- 📖 数字人格空间：情绪曲线 + 日记
- 🔁 聊天历史持久化，刷新不丢失
- 🦎 返回用户识别，7 天没来会说"我以为你忘记我了"
- 🤖 硬件版：实体树莓派机器人，能听见你、感受你

---

## License

MIT
