"""
情绪分析模块 - 通过关键词分析用户情绪
"""

from dataclasses import dataclass
from typing import Tuple

@dataclass
class EmotionResult:
    name: str        # 情绪名称
    score: float     # 0-1, 越高越积极
    intensity: str   # "low", "medium", "high"

# 情绪词库
_EMOTION_MAP = {
    "开心": {
        "keywords": ["开心","高兴","哈哈","太好了","棒","好玩","嘻嘻","不错","赞","快乐","耶","好开心"],
        "score": 0.85,
    },
    "感动": {
        "keywords": ["谢谢","感动","温暖","喜欢你","爱你","幸福","感恩","好感动"],
        "score": 0.90,
    },
    "难过": {
        "keywords": ["难过","伤心","哭","不开心","失望","心痛","委屈","想哭","好难过"],
        "score": 0.20,
    },
    "焦虑": {
        "keywords": ["焦虑","紧张","压力","担心","害怕","烦","崩溃","失眠","焦","emo"],
        "score": 0.30,
    },
    "疲惫": {
        "keywords": ["累","困","疲","好累","加班","熬夜","辛苦","打工","好困","猝死"],
        "score": 0.35,
    },
    "生气": {
        "keywords": ["生气","烦死","讨厌","气死","受不了","无语","恶心","垃圾"],
        "score": 0.20,
    },
    "平静": {
        "keywords": ["还好","一般","普通","没什么","嗯","还行","凑合"],
        "score": 0.50,
    },
}

def analyze(text: str) -> EmotionResult:
    """分析文本情绪, 返回EmotionResult"""
    text_lower = text.lower()
    
    best_emotion = "平静"
    best_score = 0.50
    match_count = 0
    
    for emotion, data in _EMOTION_MAP.items():
        count = sum(1 for kw in data["keywords"] if kw in text_lower)
        if count > match_count:
            match_count = count
            best_emotion = emotion
            best_score = data["score"]
    
    # 判断强度
    if match_count >= 3:
        intensity = "high"
    elif match_count >= 1:
        intensity = "medium"
    else:
        intensity = "low"
    
    return EmotionResult(
        name=best_emotion,
        score=best_score,
        intensity=intensity
    )
