package com.placeit.placement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationClient {

    private final RestTemplate restTemplate;

    public void sendEmail(String toEmail, String subject, String body) {
        try {
            Map<String, String> request = Map.of(
                "recipientEmail", toEmail,
                "subject", subject,
                "body", body,
                "type", "EMAIL"
            );
            restTemplate.postForObject(
                "http://notification-service/notifications/send-email",
                request,
                Map.class
            );
        } catch (Exception e) {
            log.error("Failed to send notification email to {}: {}", toEmail, e.getMessage());
        }
    }
}
