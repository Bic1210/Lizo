# LIIZOOO 48-hour MVP

## 这版已经能证明什么

这是一个**跨设备情感陪伴的可运行 Web 原型**，不是原生 iOS、Windows 或 watchOS 产品。它验证的是设计命题：同一只低干扰数字宠物能以非语言的动作，在不同设备表面维持存在感。

- `Mobile Habitat`：呼吸、摸背、长按模拟心跳（支持的手机会振动）。
- `Desktop Habitat`：Liizooo 停在论文窗口与任务栏边缘。
- `LIIZOOO NEST`：Flask + SQLite 保存一份共享的 `location / mood / energy / bond / behavior` 状态。
- `Device Jump`：源设备写入新位置，另一端页面以 1.2 秒轮询读到状态，并用入场动画出现。

## 演示步骤

1. 分别在电脑和手机浏览器打开 `/habitat`，且两端指向同一 Flask 后端。
2. 电脑端选择 `Desktop Habitat`，手机端选择 `Mobile Habitat`。
3. 在电脑端按“前往手机”——Liizooo 在电脑端离开；手机端最多约 1.2 秒后出现。
4. 手机端从头至尾滑动 Liizooo，展示摸背；长按展示“咚……咚……”和触觉反馈。
5. 选择“压力”，展示其不发文字诊断、而改为靠边慢呼吸的 `Emotion → Behavior` 逻辑。

## 论文中应使用的准确表述

可以写：

> We implemented a web-based cross-device prototype whose shared state is hosted by a Raspberry Pi-compatible Flask/SQLite service. The prototype demonstrates mobile and desktop habitats, touch-driven non-verbal behaviours, and a state-synchronised device-jump transition.

不要写：

- 已经实现原生系统级 Windows taskbar pet；目前是 Desktop Habitat 的高保真 Web 演示。
- 已经接入 Apple Watch 心率或 HRV；目前 Watch 只应写为未来可授权的感知输入。
- 已经完成用户研究；在没有真实招募与记录前，只能写为 planned evaluation。

## 开发启动

```bash
# 终端 1：前端（/api 自动代理至 :5000）
cd frontend
npm run dev

# 终端 2：LIIZOOO NEST
cd lizo
python3 -m src.main --web-only
```

打开 `http://localhost:5173/habitat`。后端首次启动会自动建立 `nest_state` 表。
