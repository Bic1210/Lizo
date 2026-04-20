package com.lizo.manager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lizo.manager.model.DiaryEntry;
import com.lizo.manager.model.LizoStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class LizoApiService {

    private final String apiUrl;
    private final int timeout;
    private final HttpClient http;
    private final ObjectMapper mapper = new ObjectMapper();

    public LizoApiService(
            @Value("${lizo.api-url}") String apiUrl,
            @Value("${lizo.timeout}") int timeout) {
        this.apiUrl = apiUrl;
        this.timeout = timeout;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(timeout))
                .build();
    }

    public LizoStatus fetchStatus() throws Exception {
        String body = get("/api/v1/status");
        JsonNode root = mapper.readTree(body);
        JsonNode data = root.path("data");
        return new LizoStatus(
                data.path("online").asBoolean(false),
                data.path("hardware").asBoolean(false));
    }

    public List<DiaryEntry> fetchDiary() throws Exception {
        String body = get("/api/v1/diary");
        JsonNode root = mapper.readTree(body);
        JsonNode data = root.path("data");
        List<DiaryEntry> entries = new ArrayList<>();
        if (data.isArray()) {
            for (JsonNode node : data) {
                entries.add(new DiaryEntry(
                        node.path("date").asText(),
                        node.path("emotion").asText(),
                        node.path("text").asText(),
                        node.path("count").asInt()));
            }
        }
        return entries;
    }

    public List<JsonNode> fetchEmotionHistory() throws Exception {
        String body = get("/api/v1/emotion");
        JsonNode root = mapper.readTree(body);
        JsonNode data = root.path("data");
        List<JsonNode> points = new ArrayList<>();
        if (data.isArray()) {
            data.forEach(points::add);
        }
        return points;
    }

    public String sendChat(String message) throws Exception {
        String payload = mapper.writeValueAsString(new java.util.HashMap<>() {{
            put("message", message);
        }});
        String body = post("/api/v1/chat", payload);
        JsonNode root = mapper.readTree(body);
        if ("success".equals(root.path("status").asText())) {
            String reply = root.path("data").path("reply").asText();
            String emotion = root.path("data").path("emotion").asText("—");
            return String.format("[%s] %s", emotion, reply);
        }
        return "(No response from Lizo)";
    }

    private String get(String path) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + path))
                .timeout(Duration.ofSeconds(timeout))
                .GET()
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        return resp.body();
    }

    private String post(String path, String json) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + path))
                .timeout(Duration.ofSeconds(timeout))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        return resp.body();
    }
}
