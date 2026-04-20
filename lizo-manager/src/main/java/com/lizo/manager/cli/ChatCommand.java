package com.lizo.manager.cli;

import com.lizo.manager.service.LizoApiService;
import org.springframework.stereotype.Component;
import picocli.CommandLine.*;

@Component
@Command(name = "chat", description = "Send a test message to Lizo", mixinStandardHelpOptions = true)
public class ChatCommand implements Runnable {

    private final LizoApiService api;

    @Parameters(index = "0", description = "Message to send", arity = "1..*")
    private String[] words;

    public ChatCommand(LizoApiService api) {
        this.api = api;
    }

    @Override
    public void run() {
        String message = String.join(" ", words);
        System.out.println("You → " + message);
        System.out.println("Waiting for Lizo…");
        try {
            String reply = api.sendChat(message);
            System.out.println("Lizo → " + reply);
        } catch (Exception e) {
            System.out.println("❌ " + e.getMessage());
        }
    }
}
