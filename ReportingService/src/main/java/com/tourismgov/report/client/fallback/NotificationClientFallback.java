package com.tourismgov.report.client.fallback;

import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;
import com.tourismgov.report.client.NotificationClient;
import com.tourismgov.report.dto.NotificationRequestDTO;

@Component
public class NotificationClientFallback implements NotificationClient {
    @Override
    public List<NotificationRequestDTO> getUnreadNotifications(Long userId) {
        return Collections.emptyList();
    }

    @Override
    public void createNotification(NotificationRequestDTO request) {
        // Log fallback action if needed, do nothing.
    }

    @Override
    public void sendGlobalBroadcast(NotificationRequestDTO request) {
        // Log fallback action if needed, do nothing.
    }
}
