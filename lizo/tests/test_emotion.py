"""
情绪分析模块测试
"""

import sys
sys.path.insert(0, "..")

from src.brain.emotion import analyze


def test_happy():
    r = analyze("今天好开心啊哈哈哈")
    assert r.name == "开心"
    assert r.score > 0.7
    print(f"✓ happy: {r}")

def test_sad():
    r = analyze("好难过想哭")
    assert r.name == "难过"
    assert r.score < 0.3
    print(f"✓ sad: {r}")

def test_tired():
    r = analyze("加班到好晚好累")
    assert r.name == "疲惫"
    assert r.score < 0.5
    print(f"✓ tired: {r}")

def test_anxious():
    r = analyze("明天考试好焦虑睡不着")
    assert r.name == "焦虑"
    print(f"✓ anxious: {r}")

def test_neutral():
    r = analyze("今天天气还好")
    assert r.name == "平静"
    print(f"✓ neutral: {r}")

def test_angry():
    r = analyze("烦死了受不了了")
    assert r.name == "生气"
    print(f"✓ angry: {r}")


if __name__ == "__main__":
    test_happy()
    test_sad()
    test_tired()
    test_anxious()
    test_neutral()
    test_angry()
    print("\n All tests passed!")
