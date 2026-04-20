"""
记忆系统 - SQLite存储对话、情绪、日记
"""

import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional


class MemoryStore:
    def __init__(self, db_path: str):
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._init()
    
    def _init(self):
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts TEXT NOT NULL,
                user_text TEXT,
                lizo_reply TEXT,
                emotion TEXT,
                score REAL
            );
            CREATE TABLE IF NOT EXISTS diary (
                date TEXT PRIMARY KEY,
                text TEXT,
                emotion TEXT,
                chat_count INTEGER
            );
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts TEXT NOT NULL,
                type TEXT
            );
        """)
        self.conn.commit()
    
    # ===== 对话 =====
    
    def save_chat(self, user_text: str, reply: str, emotion: str, score: float):
        self.conn.execute(
            "INSERT INTO chats(ts,user_text,lizo_reply,emotion,score) VALUES(?,?,?,?,?)",
            (datetime.now().isoformat(), user_text, reply, emotion, score))
        self.conn.commit()
    
    def recent_context(self, n: int = 3) -> List[Dict]:
        """最近n轮对话, 用于AI上下文"""
        rows = self.conn.execute(
            "SELECT user_text, lizo_reply FROM chats ORDER BY id DESC LIMIT ?", (n,)
        ).fetchall()
        msgs = []
        for u, a in reversed(rows):
            msgs.append({"role": "user", "content": u})
            msgs.append({"role": "assistant", "content": a})
        return msgs
    
    def today_chats(self) -> List[tuple]:
        today = datetime.now().strftime("%Y-%m-%d")
        return self.conn.execute(
            "SELECT user_text, lizo_reply, emotion FROM chats WHERE ts LIKE ?",
            (f"{today}%",)).fetchall()
    
    def today_stats(self) -> Dict:
        today = datetime.now().strftime("%Y-%m-%d")
        r = self.conn.execute(
            "SELECT COUNT(*), AVG(score) FROM chats WHERE ts LIKE ?",
            (f"{today}%",)).fetchone()
        return {"count": r[0] or 0, "avg": round(r[1] or 0, 2)}
    
    def today_dominant_emotion(self) -> str:
        today = datetime.now().strftime("%Y-%m-%d")
        r = self.conn.execute(
            "SELECT emotion, COUNT(*) c FROM chats WHERE ts LIKE ? GROUP BY emotion ORDER BY c DESC LIMIT 1",
            (f"{today}%",)).fetchone()
        return r[0] if r else "--"
    
    # ===== 情绪趋势 =====
    
    def week_emotions(self) -> List[Dict]:
        since = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        rows = self.conn.execute(
            "SELECT DATE(ts), AVG(score), COUNT(*) FROM chats WHERE ts>=? GROUP BY DATE(ts) ORDER BY DATE(ts)",
            (since,)).fetchall()
        return [{"date": r[0], "score": round(r[1], 2), "count": r[2]} for r in rows]
    
    # ===== 日记 =====
    
    def save_diary(self, text: str):
        today = datetime.now().strftime("%Y-%m-%d")
        stats = self.today_stats()
        emo = self.today_dominant_emotion()
        self.conn.execute(
            "INSERT OR REPLACE INTO diary VALUES(?,?,?,?)",
            (today, text, emo, stats["count"]))
        self.conn.commit()
    
    def get_diaries(self, n: int = 7) -> List[Dict]:
        rows = self.conn.execute(
            "SELECT date, text, emotion, chat_count FROM diary ORDER BY date DESC LIMIT ?",
            (n,)).fetchall()
        return [{"date":r[0], "text":r[1], "emotion":r[2], "count":r[3]} for r in rows]
    
    # ===== 硬件事件 =====
    
    def save_event(self, event_type: str):
        self.conn.execute(
            "INSERT INTO events(ts,type) VALUES(?,?)",
            (datetime.now().isoformat(), event_type))
        self.conn.commit()
