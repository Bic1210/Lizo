package com.lizo.manager.cli;

import com.lizo.manager.model.LizoStatus;
import com.lizo.manager.service.LizoApiService;
import org.springframework.stereotype.Component;
import picocli.CommandLine.Command;

@Component
@Command(name = "status", description = "Check if the Pi backend is reachable", mixinStandardHelpOptions = true)
public class StatusCommand implements Runnable {

    private final LizoApiService api;

    public StatusCommand(LizoApiService api) {
        this.api = api;
    }

    @Override
    public void run() {
        System.out.println("Checking Lizo backend…");
        try {
            LizoStatus status = api.fetchStatus();
            System.out.println(status.display());
        } catch (Exception e) {
            System.out.println("❌ Cannot reach backend: " + e.getMessage());
            System.out.println("   Is the Pi running? Check lizo.api-url in application.yml");
        }
    }
}
