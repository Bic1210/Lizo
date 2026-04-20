# Lizo 决策记录

> 记录重要的架构决策、设计选择和权衡。新决策追加到对应区域末尾。

---

## 架构决策

### DEC-001: 采用 Shared State + Orchestrator-Subagent 混合模式
- **日期**: 2026-04-16
- **决定**: 用文件系统作为 Agent 间共享状态，人类作为 Orchestrator 手动调用 slash command
- **理由**: 
  - 避免 Agent 互相聊天烧 token
  - 跨 Claude 会话保持状态（文件持久化）
  - 无单点故障（任何 Agent 崩溃，文件还在）
  - 符合 Anthropic 多 Agent 模式文章的推荐：先用最简单模式，观察后再演进

### DEC-002: 前端选 Web 而非 App
- **日期**: 2026-04-16
- **决定**: 做 Web 平台，不做 App
- **理由**: 开发快、无需审核、答辩直接打开浏览器、链接即分享

### DEC-003: 软硬件分层策略
- **日期**: 2026-04-16
- **决定**: 软件功能全部免费可用，硬件提供额外体验
- **理由**: 扩大用户基数，实体产品作为高价值变现手段，类任天堂 Amiibo 模式

---

## 设计决策

（由 `/designer` 填写）

---

## 代码审查

### TASK-006 全站审查报告
**日期**: 2026-04-20
**审查员**: reality-checker

---

### 总判定: 上线前必须修复

共发现 2 个 Critical 问题、4 个 Major 问题、5 个 Minor 问题。Critical 问题不修则上线即出故障。

---

### Critical 问题（阻断上线）

#### C-1: CORS 完全开放，任何来源均可调用 API
**文件**: `lizo/src/web/server.py` 第 14 行
```python
CORS(app)  # 等于 Access-Control-Allow-Origin: *
```
后端对所有来源无限制开放，且无任何认证/速率限制。任何人都可以直接 POST `/api/v1/chat`，无限消耗 OpenRouter API Key 额度，费用由机器人主人承担。
**修复**: 改为 `CORS(app, origins=["https://你的vercel域名.vercel.app"])`，并在端点加请求速率限制（flask-limiter）。

#### C-2: 消息无长度上限，后端可被超长输入攻击
**文件**: `lizo/src/web/server.py` 第 47–49 行
```python
message = body.get("message", "").strip()
if not message:
    return jsonify(...), 400
# 直接进入 brain.reply()，无长度检查
```
攻击者可发送数万字的消息，直接进入 AI 推理，既烧 token 又可能触发 OpenRouter 计费上限。Flask 默认的 `MAX_CONTENT_LENGTH` 未设置（默认无限）。
**修复**: 增加 `if len(message) > 500: return jsonify({...}), 400` 和 `app.config['MAX_CONTENT_LENGTH'] = 16 * 1024`（16 KB）。

---

### Major 问题（上线前强烈建议修复）

#### M-1: About 页是裸占位符，两个首页按钮均导向此页
**文件**: `frontend/src/pages/About.tsx`
```tsx
<p className="text-text-secondary font-display text-xl">关于 — 施工中</p>
```
`LizoHero.tsx` 和 `CTASection.tsx` 中"了解硬件版本"按钮均 `<Link to="/about">`，用户点击后看到的是一行灰色文字。在展示/上线场景会直接劝退访客。
**修复**: 最低限度做一张静态介绍卡，或将按钮暂时改为锚点 `#hardware`，移除 `/about` 路由。

#### M-2: Soul 页 fetch 错误被完全静默吞掉
**文件**: `frontend/src/pages/Soul.tsx` 第 21 行
```tsx
.catch(() => {}).finally(() => setLoading(false))
```
网络断开、后端未启动、返回格式异常——任何情况用户都只会看到空的情绪图和空的日记列表，没有任何提示。用户无法分辨"真的没有数据"和"接口挂了"。
**修复**: 增加 `error` 状态，`.catch(() => setError(true))`，在 UI 展示一条错误提示。

#### M-3: ChatWindow 动画关键帧在 `<style>` 标签中内联重复定义
**文件**: `frontend/src/components/chat/ChatWindow.tsx` 第 96–101 行
```tsx
<style>{`
  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
`}</style>
```
`index.css` 中已全局定义了 `@keyframes breathe`，这里的内联 `<style>` 会在每次 ChatWindow 渲染时注入一份重复样式。组件卸载后这段 `<style>` 节点不会自动清理，形成 DOM 泄漏。
**修复**: 删除内联 `<style>` 块，对头像 div 直接使用 `className="animate-breathe"`。

#### M-4: `package.json` 声明 React 19，但 CLAUDE.md 技术栈写的是 React 18，文档与代码不一致
**文件**: `frontend/package.json`
```json
"react": "^19.2.4"
```
React 19 是 2024 年底发布的正式版，API 层面有 breaking changes（如 `useFormStatus`、ref 作为 prop 等）。当前代码写法与 React 18 无差，但如果后续引入 React 19 新特性，文档和团队认知需要同步更新。同时 CLAUDE.md 的技术栈描述过时，会误导其他 Agent。
**修复**: 更新 CLAUDE.md 技术栈表格为 React 19，确认项目对 React 19 的依赖是有意为之。

---

### Minor 问题（可在上线后迭代）

#### N-1: ChatInput fixed bottom 在 iOS Safari 软键盘弹出时会被遮挡
**文件**: `frontend/src/components/chat/ChatInput.tsx` 第 26 行
```tsx
<div className="fixed bottom-0 left-0 right-0 px-4 pb-6 ...">
```
iOS Safari 软键盘弹出时不会触发 `window.resize`，`fixed bottom-0` 会被键盘遮住，用户实际上无法看到输入框。这是已知的 iOS Safari 老问题。
**修复**: 使用 `env(safe-area-inset-bottom)` 配合 `pb-[env(safe-area-inset-bottom)]`，或改用 CSS `dvh`（dynamic viewport height）布局，使消息区跟随视口收缩。

#### N-2: ChatMessage 用数组下标 `key={i}` 作为 React key
**文件**: `frontend/src/components/chat/ChatWindow.tsx` 第 73 行
```tsx
{messages.map((m, i) => <ChatMessage key={i} ... />)}
```
消息列表只追加不删除，目前 index 作 key 不会引发问题；但若将来支持"撤回"或"重新发送"功能，index key 会导致错误的 diff 和动画。
**修复**: 给 Message 接口加 `id: string`，发送时用 `crypto.randomUUID()` 生成，作为稳定 key。

#### N-3: EmotionChart 的 `cssVar()` 在首次渲染时读取 computed style，存在时序风险
**文件**: `frontend/src/components/soul/EmotionChart.tsx` 第 15–17 行
```tsx
function cssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
```
该函数在组件函数体顶层调用（不在 useEffect 内），颜色值在渲染时同步读取。在 SSR/预渲染场景返回 fallback（虽然当前不用 SSR，但 Vite preview 的行为可能有差异）。更严重的是：若 Tailwind v4 的 `@theme` 变量在 `<head>` 的样式表尚未应用时组件就渲染，则读取结果为空字符串，将回退到硬编码 fallback 颜色，与主题不符。
**修复**: 将 cssVar 调用移入 `useMemo` 或 `useEffect`，确保在 DOM paint 后读取。

#### N-4: VideoShowcase 和 VideoGallery 均为占位符，上线后用户能看到
**文件**: `frontend/src/components/home/VideoShowcase.tsx`，`frontend/src/components/soul/VideoGallery.tsx`
两处均显示"即梦视频即将上线"。视频内容是产品的核心卖点之一，缺失会影响首次访客的留存。
**评估**: 这是内容缺失而非代码缺陷，但如果上线时视频仍未准备好，应考虑将整个 VideoShowcase 区块和 Soul 页的视频画廊章节从路由/页面中隐藏。

#### N-5: `animate-fade-up` 动画在 Tailwind v4 中依赖 `@theme` 注册，但无 `will-change` 优化
**文件**: `frontend/src/index.css` 第 53 行
```css
--animate-fade-up: fade-up 300ms ease-out both;
```
DiaryList 使用 stagger 动画，每项都有 `animationDelay`，这是正确的做法。但 `fade-up` 同时修改 `opacity` 和 `transform`，在低端 Android 设备上可能出现合成层抖动。
**建议**: 对动画容器增加 `will-change: transform, opacity` 或 `transform: translateZ(0)` 以触发 GPU 合成。

---

### 通过项

- ✅ TypeScript 类型：所有组件 props 均有明确接口定义（`ChatMessageProps`、`ChatInputProps`、`DiaryListProps`、`EmotionChartProps`），无隐式 any，fetch 响应通过 `.status === 'success'` 做条件保护。
- ✅ 颜色 token 使用一致：全站颜色均走 `bg-lizo-*`、`text-text-*`、`bg-bg-*` 等 Tailwind token，无硬编码 hex（除 EmotionChart 内部 fallback 值，这是合理的防御性写法）。
- ✅ 字体/圆角风格统一：所有组件一致使用 `font-display` / `font-body`，圆角使用 `rounded-lg` / `rounded-xl`，视觉语言内聚。
- ✅ Soul 页 lazy load 有效：`App.tsx` 中 `const Soul = lazy(...)` + `<Suspense>` 包裹，Soul 模块会被 Vite 拆成独立 chunk，首屏不加载。
- ✅ ChatWindow 503 有感知：后端返回非 success 时，前端显示"Lizo 走神了一下，再说一次？"；catch 分支显示"信号好像不太好"，用户侧有区分。
- ✅ 发送防抖/防重：`disabled={loading}` 传递给 `ChatInput`，loading 期间按钮禁用，不会重复提交。
- ✅ 无不必要 re-render 风险：ChatWindow 的 `handleSend` 未用 `useCallback`，但 messages 均通过函数式更新 (`prev => [...]`) 操作，无闭包捕获旧 state 的问题。
- ✅ 键盘 Enter 发送：`handleKeyDown` 正确检查 `!e.shiftKey`，Shift+Enter 不会误发。
- ✅ `focusRing` 全局常量：按钮/链接焦点环均使用 `lib/styles.ts` 导出的统一 token，无键盘可访问性盲点。
- ✅ 后端 `/api/v1/chat` 的 brain None 检查：`if brain is None` 提前返回 503，不会在 brain 未初始化时崩溃。
