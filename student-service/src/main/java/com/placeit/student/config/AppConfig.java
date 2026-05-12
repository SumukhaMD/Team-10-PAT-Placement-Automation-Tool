package com.placeit.student.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * RestTemplate bean for making inter-service HTTP calls.
     * Used by StudentController to proxy auth-service for the /users fallback endpoint.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
