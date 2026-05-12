package com.placeit.notification.controller;

import com.placeit.notification.dto.NotificationRequest;
import com.placeit.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "List notifications for user")
    public ResponseEntity<?> listNotifications(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        try {
            // Return empty list for now - would need notification repository
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", List.of());
            response.put("total", 0);
            response.put("page", page);
            response.put("limit", limit);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/send-email")
    @Operation(summary = "Send email notification")
    public ResponseEntity<Map<String, String>> sendEmail(@RequestBody NotificationRequest request) {
        notificationService.sendEmail(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("message", "Notification queued for sending"));
    }

    @PostMapping("/send")
    @Operation(summary = "Send notification")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationRequest request) {
        try {
            notificationService.sendEmail(request);
            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body(Map.of("success", true, "message", "Notification sent"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            // Would update notification status in database
            return ResponseEntity.ok(Map.of("success", true, "message", "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<?> markAllAsRead(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            // Would update all notifications for user
            return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<?> getUnreadCount(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            // Would count unread notifications for user
            return ResponseEntity.ok(Map.of("success", true, "count", 0));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
