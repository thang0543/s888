package com.airplane.quanlyvemaybay;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class TestConnection implements CommandLineRunner {

    private final DataSource dataSource;

    public TestConnection(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            System.out.println("✅ Kết nối Oracle thành công!");
            System.out.println("Database: " + conn.getMetaData().getDatabaseProductName());
            System.out.println("Version: " + conn.getMetaData().getDatabaseProductVersion());
        }
    }
}