package com.lizo.manager.cli;

import org.springframework.stereotype.Component;
import picocli.CommandLine.Command;

@Component
@Command(
    name = "lizo",
    description = "Lizo local management tool",
    mixinStandardHelpOptions = true,
    version = "1.0.0",
    subcommands = {
        StatusCommand.class,
        ConfigCommand.class,
        DiaryCommand.class,
        ChatCommand.class,
        EmotionCommand.class,
    }
)
public class RootCommand implements Runnable {
    @Override
    public void run() {
        System.out.println("""
                🦎  Lizo Manager v1.0
                ─────────────────────────────────────
                Commands:
                  status    Check if the Pi backend is alive
                  config    Read / write lizo/config.yaml
                  diary     View Lizo's diary entries
                  emotion   Show emotion history (last 7 days)
                  chat      Send a test message to Lizo

                Run `lizo <command> --help` for details.
                """);
    }
}
