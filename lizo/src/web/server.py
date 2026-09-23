"""
Web面板 - Flask API + 前端页面
手机浏览器打开 http://树莓派IP:5000
"""

import uuid
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from pathlib import Path
from src.brain.persona import extract_nickname


_MAX_MESSAGE_LEN = 500
_MAX_BODY_BYTES = 16 * 1024  # 16 KB
_NEST_LOCATIONS = {"mobile", "desktop", "physical"}
_NEST_MOODS = {"calm", "stressed", "sleepy", "happy"}
_NEST_BEHAVIORS = {"resting", "breathing", "stroking", "hugging", "arriving"}


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

        nickname = extract_nickname(message)
        if nickname:
            memory.set_nickname(nickname)

        context = memory.recent_context(3)
        stats = memory.today_stats()
        profile = memory.get_profile()
        reply, emotion = brain.reply(
            message,
            context,
            stats,
            nickname=profile.get("nickname"),
        )
        memory.save_chat(message, reply, emotion.name, emotion.score)

        return jsonify({
            "status": "success",
            "data": {
                "reply": reply,
                "emotion": emotion.name,
                "profile": profile,
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

    @app.route("/api/v1/nest", methods=["GET", "PUT"])
    def api_v1_nest():
        """Shared state for the single Liizooo living across habitats."""
        if request.method == "GET":
            return jsonify({"status": "success", "data": memory.get_nest_state()})

        body = request.get_json(silent=True) or {}
        changes = {}
        if "location" in body:
            if body["location"] not in _NEST_LOCATIONS:
                return jsonify({"status": "error", "message": "invalid location"}), 400
            changes["location"] = body["location"]
        if "mood" in body:
            if body["mood"] not in _NEST_MOODS:
                return jsonify({"status": "error", "message": "invalid mood"}), 400
            changes["mood"] = body["mood"]
        if "behavior" in body:
            if body["behavior"] not in _NEST_BEHAVIORS:
                return jsonify({"status": "error", "message": "invalid behavior"}), 400
            changes["behavior"] = body["behavior"]
        for field in ("energy", "bond"):
            if field in body:
                value = body[field]
                if not isinstance(value, int) or isinstance(value, bool) or not 0 <= value <= 100:
                    return jsonify({"status": "error", "message": f"invalid {field}"}), 400
                changes[field] = value

        return jsonify({"status": "success", "data": memory.update_nest_state(**changes)})

    @app.route("/api/v1/profile")
    def api_v1_profile():
        return jsonify({"status": "success", "data": memory.get_profile()})

    @app.route("/api/v1/tts", methods=["POST"])
    def api_v1_tts():
        body = request.get_json(silent=True) or {}
        text = body.get("text", "").strip()
        if not text:
            return jsonify({"status": "error", "message": "text is required"}), 400
        if len(text) > 500:
            return jsonify({"status": "error", "message": "text too long"}), 400

        try:
            import asyncio
            import os
            import tempfile

            import edge_tts
            from flask import Response

            voice = "zh-CN-XiaoxiaoNeural"  # 温柔女声，适合 Lizo
            tmp = tempfile.mktemp(suffix=".mp3")

            async def _gen():
                communicate = edge_tts.Communicate(text, voice)
                await communicate.save(tmp)

            asyncio.run(_gen())

            with open(tmp, "rb") as f:
                audio_data = f.read()
            os.unlink(tmp)

            return Response(
                audio_data,
                mimetype="audio/mpeg",
                headers={"Content-Disposition": 'inline; filename="lizo.mp3"'},
            )
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    return app
