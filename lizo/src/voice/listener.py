"""
语音输入 - 麦克风录音 → 文字
"""

import speech_recognition as sr


class Listener:
    def __init__(self, language: str = "zh-CN", 
                 timeout: int = 5, phrase_limit: int = 8):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 1000
        self.recognizer.dynamic_energy_threshold = True
        self.language = language
        self.timeout = timeout
        self.phrase_limit = phrase_limit
    
    def listen(self) -> str | None:
        """录音并识别, 返回文字。安静/失败返回None"""
        try:
            with sr.Microphone() as source:
                print("[Ear] listening...")
                audio = self.recognizer.listen(
                    source,
                    timeout=self.timeout,
                    phrase_time_limit=self.phrase_limit,
                )
            
            print("[Ear] recognizing...")
            text = self.recognizer.recognize_google(
                audio, language=self.language
            )
            print(f"[Ear] heard: {text}")
            return text
        
        except sr.WaitTimeoutError:
            return None
        except sr.UnknownValueError:
            print("[Ear] unclear")
            return None
        except Exception as e:
            print(f"[Ear] error: {e}")
            return None
