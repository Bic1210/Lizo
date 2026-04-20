"""
语音输出 - 文字 → 语音播放
"""

import subprocess
import tempfile
from pathlib import Path


class Speaker:
    def __init__(self, voice: str = "zh-CN-XiaoyiNeural",
                 audio_dir: str = "audio"):
        self.voice = voice
        self.audio_dir = Path(audio_dir)
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def speak(self, text: str):
        """合成语音并播放"""
        print(f"[Mouth] saying: {text}")
        # 每次调用生成独立临时文件，避免并发冲突
        audio_file = tempfile.mktemp(suffix=".mp3")
        try:
            # edge-tts 合成 — 使用列表形式，禁用 shell=True，防止 shell 注入
            subprocess.run(
                ["edge-tts", "--voice", self.voice, "--text", text, "--write-media", audio_file],
                shell=False,
                capture_output=True,
                timeout=10,
            )

            # mpv 播放
            subprocess.run(
                ["mpv", "--no-video", "--really-quiet", audio_file],
                timeout=15,
            )
        except Exception as e:
            print(f"[Mouth] error: {e}")
        finally:
            # 清理临时文件
            import os
            try:
                os.unlink(audio_file)
            except OSError:
                pass
