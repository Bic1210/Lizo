package com.lizo.manager.model;

public record DiaryEntry(String date, String emotion, String text, int count) {
    public String display() {
        return String.format("[%s] %s (%d conversations)\n  %s",
                date, emotion, count,
                text.length() > 120 ? text.substring(0, 117) + "..." : text);
    }
}
