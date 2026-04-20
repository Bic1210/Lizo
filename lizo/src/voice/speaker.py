"""
语音输出 - 文字 → 语音播放
"""

import subprocess
from pathlib import Path


class Speaker:
    def __init__(self, voice: str = "zh-CN-XiaoyiNeural", 
                 audio_dir: str = "audio"):
        self.voice = voice
        self.audio_dir = Path(audio_dir)
        self.audio_dir.mkdir(parents=True, exist_ok=True)
        self.audio_file = str(self.audio_dir / "reply.mp3")
    
    def speak(self, text: str):
        """合成语音并播放"""
        print(f"[Mouth] saying: {text}")
        try:
            # edge-tts 合成
            cmd = f'edge-tts --voice {self.voice} --text "{text}" --write-media {self.audio_file}'
            subprocess.run(cmd, shell=True, capture_output=True, timeout=10)
            
            # mpv 播放
            subprocess.run(
                ["mpv", "--no-video", "--really-quiet", self.audio_file],
                timeout=15
            )
        except Exception as e:
            print(f"[Mouth] error: {e}")
