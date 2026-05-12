package com.placeit.notification.repository;

import com.placeit.notification.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByRecipientEmailAndStatus(String email, NotificationLog.NotificationStatus status);
}
