# Lizo 语音模块评估与路线图

更新日期：2026-04-20

---

## 一、现状评估

### 1.1 listener.py — 语音输入

**使用库**：`SpeechRecognition`（封装 Google Web Speech API）

**核心逻辑**：
- 调用系统麦克风录音（pyaudio 底层）
- 将音频发往 Google Cloud Speech-to-Text（免费 quota，需外网）
- 返回识别文本或 None

**局限性**：

| 问题 | 影响程度 |
|------|--------|
| 强依赖 Google 外网 API，国内延迟高、不稳定 | 高 |
| 完全本地麦克风绑定，无法迁移到 Web 端 | 高 |
| 无流式识别，必须等说完整句再处理，体验滞后感明显 | 中 |
| energy_threshold 固定为 1000，噪声环境下极易误触发或漏识 | 中 |
| 无唤醒词机制，持续占用麦克风 | 中 |
| 中文识别依赖 Google，方言、口音、说话速度影响较大 | 中 |
| phrase_time_limit=8s 对长句截断，但短 8s 内必须说完 | 低 |

### 1.2 speaker.py — 语音输出 (TTS)

**使用库**：`edge-tts`（微软 Azure Neural TTS，免费非商用额度）+ `mpv` 播放

**核心逻辑**：
- 调用 edge-tts CLI 合成 MP3 到本地 `audio/reply.mp3`
- 调用系统 mpv 播放 MP3

**局限性**：

| 问题 | 影响程度 |
|------|--------|
| 使用 shell=True 拼接命令，text 含引号或特殊字符时存在注入风险 | 高 |
| 固定覆盖同一个 reply.mp3，并发调用会文件冲突 | 高 |
| subprocess 阻塞主线程，合成+播放全程 blocking | 中 |
| 依赖本地 mpv，Web 场景完全不适用 | 高 |
| 无音频流式返回，无法在 Web 端做 streaming audio 播放 | 高 |
| edge-tts 需要外网连接微软服务，延迟约 500ms-1s | 中 |

### 1.3 chat.py — AI 对话引擎

**使用库**：`openai` SDK（转发到 OpenRouter）

**优点**：
- 架构清晰，情绪分析和对话历史已分离
- max_tokens=80 控制回复长度合理（配合 TTS 不会生成超长句子）
- fallback 兜底逻辑完整

**与语音集成的潜在问题**：
- 无流式（streaming）输出，必须等完整回复再 TTS，增加感知延迟
- 整链路延迟估算：STT ~1-2s + LLM ~1-2s + TTS ~0.5-1s = **总 2.5-5s 响应延迟**

---

## 二、短期改进（1-2 周内可做，不拆已有硬件逻辑）

### 2.1 修复 speaker.py 安全与稳定性

- 将 edge-tts 改用 Python API 调用（`edge_tts.Communicate`），彻底避免 shell 注入
- 音频文件名加时间戳或 UUID，防止并发覆盖
- 合成改为异步（asyncio），释放主线程

### 2.2 降低 listener.py 延迟与噪声敏感

- 开启 `adjust_for_ambient_noise()` 自动校准 energy_threshold（每次启动时做一次）
- 将 Google STT 作为备用，主路切换为可选的本地 Whisper（`faster-whisper` small 模型，中文 WER 约 8-12%，完全离线）

### 2.3 LLM 流式输出对接

- `chat.py` 的 `reply()` 增加 `stream=True` 选项
- 流式 token 到达时边生成边分句（以句号/问号/感叹号切割），每句完成立即送 TTS，实现「边说边播」
- 感知延迟可从 3-5s 降低到 **1-1.5s 首字节时间**

---

## 三、Web 语音接入方案

### 3.1 整体架构

```
浏览器
  └─ Web Speech API (STT) 或 MediaRecorder (录音)
       │  文本 / 音频 Blob
       ▼
  WebSocket / HTTP POST  →  Flask 后端
                                │
                         chat.py (LLM)
                                │
                      edge-tts / Azure TTS
                                │
                     音频流 (MP3/Opus) 返回
                                ▼
                         浏览器 <audio> 播放
```

### 3.2 浏览器端 STT 选择

**方案 A：Web Speech API（推荐用于快速上线）**

优点：
- 零成本，Chrome/Edge 原生支持，无需上传音频
- 中文识别质量与 Google Cloud 相同（背后同一引擎）
- 实时流式字幕，用户体验好

缺点：
- 仅 Chrome/Edge 完整支持，Firefox/Safari 不支持或有限
- 需要 HTTPS（localhost 除外）
- 国内 Chrome 调用 Google 后端，同样存在外网依赖

**方案 B：MediaRecorder + 后端 Whisper（推荐用于离线/国内场景）**

优点：
- 跨浏览器兼容（所有现代浏览器支持 MediaRecorder）
- 后端用 `faster-whisper` 处理，完全可控，国内可用
- 可在树莓派本地部署 small 模型（约 500MB）

缺点：
- 需要完整录完一段再发送（非实时流式），有 0.5-1s 额外传输延迟
- 后端需要音频解码依赖（ffmpeg）

**推荐**：前端先用 Web Speech API 快速验证体验，后续补充 Whisper 作为降级方案。

### 3.3 后端 TTS 返回

推荐链路：
1. Flask 接收文本请求
2. 调用 `edge_tts.Communicate`（Python API，非 CLI）异步合成
3. 以 `audio/mpeg` 流式返回给前端（streaming response）
4. 前端 `<audio src="...">` 或 Web Audio API 播放

新增一个轻量 API 端点示例（仅规划，不写实现）：
- `POST /api/chat` — 接收文本，返回 `{reply: "...", emotion: "..."}`
- `POST /api/tts` — 接收文本，返回 MP3 音频流
- 或合并为 `POST /api/voice-chat` — 接收文本，返回 JSON + 附带音频 URL

### 3.4 WebSocket 实时方案（中期目标）

将上述 HTTP 请求升级为 WebSocket，实现：
- 客户端推送语音片段（VAD 切分）
- 服务端实时 STT + 流式 LLM + 分句 TTS
- 服务端推送音频片段回客户端
- 目标端到端延迟：< 1.5s

---

## 四、推荐技术选型汇总

| 场景 | 推荐方案 | 备选 |
|------|--------|------|
| 树莓派本地 STT | faster-whisper small (离线) | Google STT (联网) |
| Web 端 STT（快速上线） | Web Speech API | — |
| Web 端 STT（长期/国内） | MediaRecorder + 后端 Whisper | — |
| TTS 合成 | edge-tts Python API (免费) | Azure TTS SDK (付费，更稳定) |
| TTS 播放（本地） | mpv（保持现状） | — |
| TTS 播放（Web） | 浏览器 Audio API | — |
| LLM | OpenRouter GPT-4o-mini（现有） | 保持不变 |
| 实时通信（Web） | WebSocket（Flask-SocketIO） | HTTP SSE |

---

## 五、优先级建议

1. **P0（本周）**：修复 speaker.py shell 注入问题，改用 Python API
2. **P1（第1周）**：增加 `/api/chat` + `/api/tts` 两个 Flask 端点，供前端调用
3. **P2（第1-2周）**：前端集成 Web Speech API，完成端到端 Web 语音对话 MVP
4. **P3（第2周+）**：LLM 流式输出 + 分句 TTS，优化响应延迟
5. **P4（后续）**：WebSocket 全双工 + 后端 Whisper 降级方案
