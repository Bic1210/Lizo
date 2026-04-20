package com.lizo.manager;

import com.lizo.manager.cli.RootCommand;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.ExitCodeGenerator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import picocli.CommandLine;
import picocli.CommandLine.IFactory;

@SpringBootApplication
public class LizoManagerApplication implements CommandLineRunner, ExitCodeGenerator {

    private final RootCommand rootCommand;
    private final IFactory factory;
    private int exitCode;

    public LizoManagerApplication(RootCommand rootCommand, IFactory factory) {
        this.rootCommand = rootCommand;
        this.factory = factory;
    }

    public static void main(String[] args) {
        System.exit(SpringApplication.exit(SpringApplication.run(LizoManagerApplication.class, args)));
    }

    @Override
    public void run(String... args) {
        exitCode = new CommandLine(rootCommand, factory).execute(args);
    }

    @Override
    public int getExitCode() {
        return exitCode;
    }
}
