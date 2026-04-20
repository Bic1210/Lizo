"""
对话引擎 - 通过OpenRouter API与用户对话
"""

import openai
from typing import Tuple, Optional

from .persona import SYSTEM_PROMPT, FALLBACK_REPLIES
from .emotion import analyze, EmotionResult


class ChatEngine:
    def __init__(self, api_key: str, base_url: str, model: str, 
                 max_tokens: int = 80, temperature: float = 0.8):
        self.client = openai.OpenAI(api_key=api_key, base_url=base_url)
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
    
    def reply(self, user_text: str, context: list = None, 
              stats: dict = None) -> Tuple[str, EmotionResult]:
        """
        生成蜥蜴回复
        
        Args:
            user_text: 用户说的话
            context: 最近的对话历史 [{"role":"user","content":...}, ...]
            stats: 今日统计 {"count": 5, "avg": 0.6}
        
        Returns:
            (reply_text, emotion_result)
        """
        # 分析情绪
        emotion = analyze(user_text)
        
        # 构建消息
        context_note = f"\n[用户当前情绪:{emotion.name}({emotion.intensity})"
        if stats:
            context_note += f" 今日第{stats.get('count',0)+1}次对话"
        context_note += "]"
        
        messages = [{"role": "system", "content": SYSTEM_PROMPT + context_note}]
        
        if context:
            messages.extend(context)
        
        messages.append({"role": "user", "content": user_text})
        
        # 调用API
        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )
            reply_text = resp.choices[0].message.content.strip()
        except Exception as e:
            print(f"[ChatEngine] API错误: {e}")
            reply_text = FALLBACK_REPLIES.get(emotion.name, "嗯~我在这里")
        
        return reply_text, emotion
    
    def generate_diary(self, conversations: list, stats: dict) -> str:
        """
        生成今日蜥蜴日记
        
        Args:
            conversations: [(user_text, lizo_reply, emotion), ...]
            stats: {"count": N, "avg": 0.6}
        """
        if not conversations:
            return "今天主人没有来找我, 我自己安安静静待了一天~"
        
        summary = f"今天和主人聊了{stats['count']}次。"
        for u, a, e in conversations[-5:]:
            summary += f"主人说'{u}',我说'{a}'(情绪:{e})。"
        
        prompt = "你是Lizo小蜥蜴, 用第一人称写50-80字的日记, 温柔可爱, 记录今天和主人的互动。不用emoji。"
        
        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": summary},
                ],
                max_tokens=120,
                temperature=0.9,
            )
            return resp.choices[0].message.content.strip()
        except:
            return f"今天和主人聊了{stats['count']}次, 希望明天也能陪在主人身边~"
