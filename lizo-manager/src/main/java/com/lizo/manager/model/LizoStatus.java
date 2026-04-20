package com.lizo.manager.model;

public record LizoStatus(boolean online, boolean hardware) {
    public String display() {
        return String.format("Backend: %s  |  Hardware: %s",
                online ? "✅ Online" : "❌ Offline",
                hardware ? "✅ Connected" : "⬜ Web-only");
    }
}
