"""
Web面板 - Flask API + 前端页面
手机浏览器打开 http://树莓派IP:5000
"""

import uuid
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from pathlib import Path


_MAX_MESSAGE_LEN = 500
_MAX_BODY_BYTES = 16 * 1024  # 16 KB


def create_app(memory, brain=None, cors_origins: str = "http://localhost:5173"):
    app = Flask(__name__, static_folder=str(Path(__file__).parent / "dashboard"))
    app.config["MAX_CONTENT_LENGTH"] = _MAX_BODY_BYTES
    origins = [o.strip() for o in cors_origins.split(",") if o.strip()]
    CORS(app, origins=origins)
    
    @app.route("/")
    def index():
        return send_from_directory(app.static_folder, "index.html")
    
    @app.route("/api/today")
    def api_today():
        stats = memory.today_stats()
        stats["emotion"] = memory.today_dominant_emotion()
        return jsonify(stats)
    
    @app.route("/api/week")
    def api_week():
        return jsonify(memory.week_emotions())
    
    @app.route("/api/diaries")
    def api_diaries():
        return jsonify(memory.get_diaries())
    
    @app.route("/api/chats")
    def api_chats():
        chats = memory.today_chats()
        return jsonify([
            {"user": c[0], "lizo": c[1], "emotion": c[2]} 
            for c in chats
        ])
    
    # === v1 API (for React frontend) ===

    @app.route("/api/v1/chat", methods=["POST"])
    def api_v1_chat():
        body = request.get_json(silent=True) or {}
        message = body.get("message", "").strip()
        if not message:
            return jsonify({"status": "error", "message": "message is required"}), 400
        if len(message) > _MAX_MESSAGE_LEN:
            return jsonify({"status": "error", "message": "message too long"}), 400
        if brain is None:
            return jsonify({"status": "error", "message": "AI not initialized"}), 503

        context = memory.recent_context(3)
        stats = memory.today_stats()
        reply, emotion = brain.reply(message, context, stats)
        memory.save_chat(message, reply, emotion.name, emotion.score)

        return jsonify({
            "status": "success",
            "data": {
                "reply": reply,
                "emotion": emotion.name,
                "session_id": body.get("session_id") or str(uuid.uuid4()),
            }
        })

    @app.route("/api/v1/diary")
    def api_v1_diary():
        return jsonify({"status": "success", "data": memory.get_diaries()})

    @app.route("/api/v1/emotion")
    def api_v1_emotion():
        return jsonify({"status": "success", "data": memory.week_emotions()})

    @app.route("/api/v1/status")
    def api_v1_status():
        return jsonify({"status": "success", "data": {"online": True, "hardware": False}})

    return app
