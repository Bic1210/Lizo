"""
Arduino串口通信 - 控制蜥蜴的身体(表情/呼吸/心跳)
"""

import time
import serial
from typing import List


class ArduinoController:
    def __init__(self, port: str = "/dev/ttyUSB0", baud: int = 9600):
        self.ser = None
        try:
            self.ser = serial.Serial(port, baud, timeout=1)
            time.sleep(2)  # 等Arduino重启
            print(f"[Body] Arduino connected: {port}")
        except Exception as e:
            print(f"[Body] Arduino not found: {e}")
            print("[Body] running without hardware")
    
    @property
    def connected(self) -> bool:
        return self.ser is not None and self.ser.is_open
    
    def send(self, cmd: str):
        if self.connected:
            try:
                self.ser.write(f"{cmd}\n".encode())
            except:
                pass
    
    def read_events(self) -> List[str]:
        events = []
        if self.connected:
            while self.ser.in_waiting:
                try:
                    line = self.ser.readline().decode().strip()
                    if line.startswith("EVENT:"):
                        events.append(line)
                except:
                    break
        return events
    
    # ===== 高级指令 =====
    
    def listen_start(self):
        self.send("CMD:LISTEN_START")
    
    def listen_stop(self):
        self.send("CMD:LISTEN_STOP")
    
    def speak_start(self):
        self.send("CMD:SPEAK_START")
    
    def speak_stop(self):
        self.send("CMD:SPEAK_STOP")
    
    def show_happy(self):
        self.send("CMD:HAPPY")
    
    def show_love(self):
        self.send("CMD:LOVE")
    
    def react_to_emotion(self, emotion: str, score: float):
        """根据情绪控制蜥蜴反应"""
        if score >= 0.7:
            self.show_happy()
        elif score <= 0.3:
            self.show_love()  # 低落时给爱心安慰
