package com.lizo.manager.cli;

import com.fasterxml.jackson.databind.JsonNode;
import com.lizo.manager.service.LizoApiService;
import org.springframework.stereotype.Component;
import picocli.CommandLine.Command;

import java.util.List;

@Component
@Command(name = "emotion", description = "Show emotion score history (last 7 days)", mixinStandardHelpOptions = true)
public class EmotionCommand implements Runnable {

    private final LizoApiService api;

    public EmotionCommand(LizoApiService api) {
        this.api = api;
    }

    @Override
    public void run() {
        try {
            List<JsonNode> points = api.fetchEmotionHistory();
            if (points.isEmpty()) {
                System.out.println("No emotion data yet.");
                return;
            }
            System.out.println("📈 Emotion History");
            System.out.println("─".repeat(50));
            System.out.printf("%-12s %8s %10s%n", "Date", "Score", "Chats");
            System.out.println("─".repeat(50));
            for (JsonNode p : points) {
                double score = p.path("score").asDouble();
                int count = p.path("count").asInt();
                String date = p.path("date").asText();
                String bar = "█".repeat((int) Math.round(score * 20));
                System.out.printf("%-12s %6.2f  %-22s %3d%n", date, score, bar, count);
            }
            System.out.println();
            double avg = points.stream()
                    .mapToDouble(p -> p.path("score").asDouble())
                    .average().orElse(0);
            System.out.printf("Average: %.2f%n", avg);
        } catch (Exception e) {
            System.out.println("❌ Cannot fetch emotion data: " + e.getMessage());
        }
    }
}
