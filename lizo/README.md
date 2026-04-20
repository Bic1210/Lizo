# 🦎 Lizo - AI Companion Lizard Robot

基于AIGC技术的治愈系蜥蜴陪伴机器人，具有语音对话、情绪感知、记忆系统和数字人格。

> 上海交通大学 PRP 项目

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Lizo System                 │
├──────────────┬──────────────────────────────┤
│   Hardware   │         Software             │
│  (Arduino)   │      (Raspberry Pi)          │
│              │                              │
│  ┌────────┐  │  ┌──────────┐  ┌──────────┐ │
│  │ Servo  │  │  │ Listener │  │  ChatAI  │ │
│  │ Motor  │◄─┼──│ Speaker  │  │ Emotion  │ │
│  │ LCD    │  │  │ (Voice)  │  │ Memory   │ │
│  │ Sensor │──┼─►│          │  │ Diary    │ │
│  └────────┘  │  └──────────┘  └──────────┘ │
│              │         │                    │
│              │  ┌──────┴──────┐             │
│              │  │ Web Dashboard│             │
│              │  │  (React/TS) │             │
│              │  └─────────────┘             │
└──────────────┴──────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Hardware Control | C++ (Arduino) |
| Backend | Python 3.11+ |
| AI Dialogue | OpenRouter API (GPT-4o-mini / Claude) |
| Voice Input | Google Speech Recognition |
| Voice Output | Edge-TTS (Microsoft) |
| Database | SQLite |
| Web Frontend | TypeScript + React |
| Communication | Serial (UART) |

## Project Structure

```
lizo/
├── config.yaml              # Configuration
├── requirements.txt         # Python dependencies
├── src/
│   ├── main.py             # Entry point
│   ├── brain/              # AI & Emotion
│   │   ├── chat.py         # Dialogue engine
│   │   ├── emotion.py      # Emotion analysis
│   │   └── persona.py      # Personality system
│   ├── voice/              # Speech I/O
│   │   ├── listener.py     # Speech-to-text
│   │   └── speaker.py      # Text-to-speech
│   ├── memory/             # Persistent storage
│   │   └── database.py     # SQLite operations
│   ├── hardware/           # Physical control
│   │   └── arduino.py      # Serial communication
│   └── web/                # Dashboard
│       ├── server.py       # Flask API
│       └── dashboard/      # React frontend
├── arduino/
│   └── lizo_v4.ino         # Arduino firmware
├── tests/
│   └── test_emotion.py     # Unit tests
└── docs/
    └── architecture.md     # Design docs
```

## Quick Start

### 1. Raspberry Pi Setup
```bash
git clone <repo>
cd lizo
pip3 install -r requirements.txt --break-system-packages
sudo apt install -y python3-pyaudio portaudio19-dev mpv
```

### 2. Configure
```bash
cp config.yaml.example config.yaml
# Edit config.yaml: set your OpenRouter API key
```

### 3. Run
```bash
# Voice mode (full experience)
python3 -m src.main

# Text mode (for debugging, no mic needed)
python3 -m src.main --text

# Web dashboard only
python3 -m src.main --web-only
```

### 4. Web Dashboard
Open `http://<raspberry-pi-ip>:5000` on your phone.

## Hardware

### Arduino Wiring

| Module | Pin |
|--------|-----|
| LCD 1602A (RS,E,D4-D7) | 12, 11, 5, 4, 3, 2 |
| SG90 Servo (breathing) | 9 |
| Motor (heartbeat) | 10 |
| Buzzer | 6 |
| HC-SR04 Trig | 7 |
| HC-SR04 Echo | 8 |
| TTP223 Touch x2 | A1, A2 |
| B10K Potentiometer | A0 |

## Features

- **Voice Dialogue**: Speak to Lizo, get warm responses
- **Emotion Tracking**: Analyzes your mood from conversations
- **Memory**: Remembers past conversations, builds context
- **Daily Diary**: AI-generated diary from Lizo's perspective
- **Physical Interaction**: Breathing, heartbeat, touch response
- **Proximity Detection**: Wakes up when you approach
- **Web Dashboard**: View emotion trends and diary history

## License

MIT
