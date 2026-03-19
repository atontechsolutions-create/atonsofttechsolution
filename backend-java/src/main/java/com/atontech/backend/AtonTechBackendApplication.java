package com.atontech.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class AtonTechBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AtonTechBackendApplication.class, args);
	}

	@GetMapping("/api/java/status")
	public String getStatus() {
		return "ATON TECH Java Backend is active and optimized.";
	}
}
