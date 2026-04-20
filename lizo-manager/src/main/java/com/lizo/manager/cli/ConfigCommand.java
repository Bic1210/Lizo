package com.lizo.manager.cli;

import com.lizo.manager.service.ConfigService;
import org.springframework.stereotype.Component;
import picocli.CommandLine.*;

import java.util.Map;

@Component
@Command(
    name = "config",
    description = "Read or write lizo/config.yaml",
    mixinStandardHelpOptions = true,
    subcommands = {
        ConfigCommand.GetCmd.class,
        ConfigCommand.SetCmd.class,
        ConfigCommand.ShowCmd.class,
    }
)
public class ConfigCommand implements Runnable {

    @Override
    public void run() {
        System.out.println("Usage: lizo config [get|set|show] --help");
    }

    // ── lizo config show ──────────────────────────────────────────────────
    @Component
    @Command(name = "show", description = "Print the full config.yaml", mixinStandardHelpOptions = true)
    static class ShowCmd implements Runnable {
        private final ConfigService cfg;
        ShowCmd(ConfigService cfg) { this.cfg = cfg; }

        @Override
        public void run() {
            try {
                System.out.println("Config path: " + cfg.getConfigPath());
                System.out.println("─".repeat(50));
                Map<String, Object> config = cfg.load();
                printMap(config, 0);
            } catch (Exception e) {
                System.out.println("❌ " + e.getMessage());
            }
        }

        private void printMap(Map<?, ?> map, int indent) {
            String pad = "  ".repeat(indent);
            map.forEach((k, v) -> {
                if (v instanceof Map<?, ?> nested) {
                    System.out.println(pad + k + ":");
                    printMap(nested, indent + 1);
                } else {
                    // Mask API keys
                    String display = k.toString().contains("key") && v != null && v.toString().length() > 6
                            ? v.toString().substring(0, 4) + "****"
                            : String.valueOf(v);
                    System.out.println(pad + k + ": " + display);
                }
            });
        }
    }

    // ── lizo config get <key> ─────────────────────────────────────────────
    @Component
    @Command(name = "get", description = "Get a config value (dot-notation, e.g. ai.model)", mixinStandardHelpOptions = true)
    static class GetCmd implements Runnable {
        private final ConfigService cfg;

        @Parameters(index = "0", description = "Dot-notation key (e.g. ai.model)")
        private String key;

        GetCmd(ConfigService cfg) { this.cfg = cfg; }

        @Override
        public void run() {
            try {
                String value = cfg.get(key);
                if (value == null) {
                    System.out.println("Key not found: " + key);
                } else {
                    boolean isSensitive = key.contains("key");
                    String display = isSensitive && value.length() > 6
                            ? value.substring(0, 4) + "****"
                            : value;
                    System.out.println(key + " = " + display);
                }
            } catch (Exception e) {
                System.out.println("❌ " + e.getMessage());
            }
        }
    }

    // ── lizo config set <key> <value> ─────────────────────────────────────
    @Component
    @Command(name = "set", description = "Set a config value (dot-notation, e.g. web.cors_origins https://...)", mixinStandardHelpOptions = true)
    static class SetCmd implements Runnable {
        private final ConfigService cfg;

        @Parameters(index = "0", description = "Dot-notation key (e.g. web.cors_origins)")
        private String key;

        @Parameters(index = "1", description = "New value")
        private String value;

        SetCmd(ConfigService cfg) { this.cfg = cfg; }

        @Override
        public void run() {
            try {
                String old = cfg.get(key);
                cfg.set(key, value);
                System.out.printf("✅ %s: %s → %s%n", key,
                        old != null ? old : "(not set)", value);
            } catch (Exception e) {
                System.out.println("❌ " + e.getMessage());
            }
        }
    }
}
