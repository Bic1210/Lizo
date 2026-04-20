#!/usr/bin/env python3
"""
============================================
 Lizo v4.0 - 主入口
============================================

Usage:
  python3 -m src.main              # 正常运行 (语音对话)
  python3 -m src.main --text       # 文字模式 (键盘输入, 调试用)
  python3 -m src.main --web-only   # 只启动Web面板
"""

import sys
import time
import threading
import argparse
from datetime import datetime
from pathlib import Path

import yaml

# 模块导入
from src.brain.chat import ChatEngine
from src.brain.emotion import analyze
from src.memory.database import MemoryStore
from src.hardware.arduino import ArduinoController
from src.web.server import create_app


def load_config() -> dict:
    config_path = Path(__file__).parent.parent / "config.yaml"
    with open(config_path) as f:
        return yaml.safe_load(f)


def run_voice_mode(config, memory, brain, body):
    """语音对话模式"""
    from src.voice.listener import Listener
    from src.voice.speaker import Speaker
    
    ear = Listener(
        language=config["voice"]["stt_language"],
        timeout=config["voice"]["listen_timeout"],
        phrase_limit=config["voice"]["phrase_limit"],
    )
    mouth = Speaker(
        voice=config["voice"]["tts_voice"],
        audio_dir=config["paths"]["audio_dir"],
    )
    
    chat_count = 0
    last_diary_date = ""
    
    print("\n[System] Voice mode active. Speak to Lizo!")
    print("[System] Ctrl+C to exit\n")
    
    try:
        while True:
            # 读取Arduino事件
            for event in body.read_events():
                print(f"[Event] {event}")
                memory.save_event(event)
            
            # 听
            body.listen_start()
            text = ear.listen()
            body.listen_stop()
            
            if text is None:
                time.sleep(0.3)
                continue
            
            # 想
            context = memory.recent_context(3)
            stats = memory.today_stats()
            reply, emotion = brain.reply(text, context, stats)
            
            memory.save_chat(text, reply, emotion.name, emotion.score)
            body.react_to_emotion(emotion.name, emotion.score)
            chat_count += 1
            
            # 说
            body.speak_start()
            mouth.speak(reply)
            body.speak_stop()
            
            print(f"[Chat #{chat_count}] emotion={emotion.name}({emotion.score})\n")
            
            # 生成日记
            today = datetime.now().strftime("%Y-%m-%d")
            if today != last_diary_date and chat_count >= 3:
                diary = brain.generate_diary(memory.today_chats(), stats)
                memory.save_diary(diary)
                print(f"[Diary] {diary}\n")
                last_diary_date = today
    
    except KeyboardInterrupt:
        print("\n[System] Lizo going to sleep...")
        body.send("CMD:SLEEP")
        if chat_count > 0:
            stats = memory.today_stats()
            diary = brain.generate_diary(memory.today_chats(), stats)
            memory.save_diary(diary)
            print(f"[Diary] {diary}")


def run_text_mode(config, memory, brain, body):
    """文字对话模式 (调试用, 不需要麦克风和喇叭)"""
    chat_count = 0
    
    print("\n[System] Text mode. Type to chat with Lizo!")
    print("[System] Type 'quit' to exit, 'diary' to generate diary\n")
    
    try:
        while True:
            text = input("你: ").strip()
            
            if not text:
                continue
            if text.lower() == "quit":
                break
            if text.lower() == "diary":
                stats = memory.today_stats()
                diary = brain.generate_diary(memory.today_chats(), stats)
                memory.save_diary(diary)
                print(f"\n[Lizo日记] {diary}\n")
                continue
            
            context = memory.recent_context(3)
            stats = memory.today_stats()
            reply, emotion = brain.reply(text, context, stats)
            
            memory.save_chat(text, reply, emotion.name, emotion.score)
            body.react_to_emotion(emotion.name, emotion.score)
            chat_count += 1
            
            print(f"Lizo: {reply}")
            print(f"  [{emotion.name} | score:{emotion.score}]\n")
    
    except (KeyboardInterrupt, EOFError):
        pass
    
    print("[System] bye~")
    if chat_count > 0:
        stats = memory.today_stats()
        diary = brain.generate_diary(memory.today_chats(), stats)
        memory.save_diary(diary)
        print(f"[Diary] {diary}")


def main():
    parser = argparse.ArgumentParser(description="Lizo - 蜥蜴陪伴机器人")
    parser.add_argument("--text", action="store_true", help="文字模式(调试)")
    parser.add_argument("--web-only", action="store_true", help="只启动Web面板")
    args = parser.parse_args()
    
    # 加载配置
    config = load_config()
    
    # 检查API Key
    if config["ai"]["api_key"] == "YOUR_OPENROUTER_KEY_HERE":
        print("!" * 40)
        print("请先设置 OpenRouter API Key!")
        print("1. 去 https://openrouter.ai 注册")
        print("2. 创建 API Key")
        print("3. 修改 config.yaml 中的 api_key")
        print("!" * 40)
        sys.exit(1)
    
    print("=" * 40)
    print("  Lizo v4.0 🦎")
    print("=" * 40)
    
    # 初始化模块
    memory = MemoryStore(config["paths"]["database"])
    brain = ChatEngine(
        api_key=config["ai"]["api_key"],
        base_url=config["ai"]["base_url"],
        model=config["ai"]["model"],
        max_tokens=config["ai"]["max_tokens"],
        temperature=config["ai"]["temperature"],
    )
    body = ArduinoController(
        port=config["arduino"]["port"],
        baud=config["arduino"]["baud"],
    )
    
    # 启动Web
    web = create_app(memory, brain, cors_origins=config["web"].get("cors_origins", "http://localhost:5173"))
    web_thread = threading.Thread(
        target=lambda: web.run(
            host=config["web"]["host"],
            port=config["web"]["port"],
            debug=False,
        ),
        daemon=True,
    )
    web_thread.start()
    print(f"[Web] http://0.0.0.0:{config['web']['port']}")
    
    if args.web_only:
        print("[System] Web-only mode. Ctrl+C to exit.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        return
    
    # 运行对话
    if args.text:
        run_text_mode(config, memory, brain, body)
    else:
        run_voice_mode(config, memory, brain, body)


if __name__ == "__main__":
    main()
