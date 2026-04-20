package com.lizo.manager.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

import java.io.*;
import java.nio.file.*;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Reads and writes lizo/config.yaml safely.
 * All writes are atomic (write-to-temp, then rename).
 */
@Service
public class ConfigService {

    private final Path configPath;
    private final Yaml yaml;

    public ConfigService(@Value("${lizo.config-path}") String configPathStr) {
        this.configPath = Path.of(configPathStr).toAbsolutePath().normalize();
        DumperOptions opts = new DumperOptions();
        opts.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
        opts.setPrettyFlow(true);
        this.yaml = new Yaml(opts);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> load() throws IOException {
        if (!Files.exists(configPath)) {
            throw new FileNotFoundException("Config not found: " + configPath);
        }
        try (Reader r = Files.newBufferedReader(configPath)) {
            Map<String, Object> loaded = yaml.load(r);
            return loaded != null ? loaded : new LinkedHashMap<>();
        }
    }

    public void save(Map<String, Object> config) throws IOException {
        Path tmp = configPath.resolveSibling(configPath.getFileName() + ".tmp");
        try (Writer w = Files.newBufferedWriter(tmp)) {
            yaml.dump(config, w);
        }
        Files.move(tmp, configPath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
    }

    @SuppressWarnings("unchecked")
    public void set(String dotKey, String value) throws IOException {
        Map<String, Object> config = load();
        String[] keys = dotKey.split("\\.");
        Map<String, Object> node = config;
        for (int i = 0; i < keys.length - 1; i++) {
            node = (Map<String, Object>) node.computeIfAbsent(keys[i], k -> new LinkedHashMap<>());
        }
        node.put(keys[keys.length - 1], value);
        save(config);
    }

    @SuppressWarnings("unchecked")
    public String get(String dotKey) throws IOException {
        Map<String, Object> config = load();
        String[] keys = dotKey.split("\\.");
        Object node = config;
        for (String key : keys) {
            if (node instanceof Map<?, ?> m) {
                node = m.get(key);
            } else {
                return null;
            }
        }
        return node != null ? node.toString() : null;
    }

    public Path getConfigPath() {
        return configPath;
    }
}
