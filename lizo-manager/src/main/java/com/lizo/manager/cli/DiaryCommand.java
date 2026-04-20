package com.lizo.manager.cli;

import com.lizo.manager.model.DiaryEntry;
import com.lizo.manager.service.LizoApiService;
import org.springframework.stereotype.Component;
import picocli.CommandLine.*;

import java.util.List;

@Component
@Command(name = "diary", description = "View Lizo's diary entries", mixinStandardHelpOptions = true)
public class DiaryCommand implements Runnable {

    private final LizoApiService api;

    @Option(names = {"-n", "--limit"}, description = "Max entries to show (default: 7)", defaultValue = "7")
    private int limit;

    public DiaryCommand(LizoApiService api) {
        this.api = api;
    }

    @Override
    public void run() {
        try {
            List<DiaryEntry> entries = api.fetchDiary();
            if (entries.isEmpty()) {
                System.out.println("No diary entries yet.");
                return;
            }
            System.out.println("📔 Lizo's Diary");
            System.out.println("─".repeat(50));
            entries.stream().limit(limit).forEach(e -> {
                System.out.println(e.display());
                System.out.println();
            });
            if (entries.size() > limit) {
                System.out.printf("  … and %d more entries. Use -n %d to see all.%n",
                        entries.size() - limit, entries.size());
            }
        } catch (Exception e) {
            System.out.println("❌ Cannot fetch diary: " + e.getMessage());
        }
    }
}
