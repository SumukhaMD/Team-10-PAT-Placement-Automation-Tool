package com.placeit.notification.service;

import com.placeit.notification.dto.NotificationRequest;
import com.placeit.notification.entity.NotificationLog;
import com.placeit.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationLogRepository notificationLogRepository;

    public void sendEmail(NotificationRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(request.getRecipientEmail());
            message.setSubject(request.getSubject());
            message.setText(request.getBody());

            mailSender.send(message);

            NotificationLog notificationLog = NotificationLog.builder()
                    .recipientEmail(request.getRecipientEmail())
                    .subject(request.getSubject())
                    .body(request.getBody())
                    .type(NotificationLog.NotificationType.valueOf(request.getType()))
                    .status(NotificationLog.NotificationStatus.SENT)
                    .sentAt(LocalDateTime.now())
                    .build();

            notificationLogRepository.save(notificationLog);
            log.info("Email sent successfully to: {}", request.getRecipientEmail());

        } catch (Exception e) {
            log.error("Failed to send email to: {}", request.getRecipientEmail(), e);

            NotificationLog notificationLog = NotificationLog.builder()
                    .recipientEmail(request.getRecipientEmail())
                    .subject(request.getSubject())
                    .body(request.getBody())
                    .type(NotificationLog.NotificationType.valueOf(request.getType()))
                    .status(NotificationLog.NotificationStatus.FAILED)
                    .errorMessage(e.getMessage())
                    .build();

            notificationLogRepository.save(notificationLog);
        }
    }
}
