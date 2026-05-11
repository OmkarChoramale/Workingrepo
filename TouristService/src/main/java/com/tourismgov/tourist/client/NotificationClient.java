package com.tourismgov.tourist.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.tourismgov.tourist.dto.NotificationRequestDTO;

@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationClient {

    /**
     * PRIVATE MESSAGE: Hits @PostMapping in Controller
     * URL: http://NOTIFICATION-SERVICE/tourismgov/v1/notifications
     * Use this when only ONE specific user needs to be notified.
     */
    @PostMapping("/tourismgov/v1/notifications")
    void createNotification(@RequestBody NotificationRequestDTO request);

    /**
     * GLOBAL NOTIFICATION: Hits @PostMapping("/broadcast") in Controller
     * URL: http://NOTIFICATION-SERVICE/tourismgov/v1/notifications/broadcast
     * Use this when EVERY user in the system should receive the message.
     */
    @PostMapping("/tourismgov/v1/notifications/broadcast")
    void sendGlobalBroadcast(@RequestBody NotificationRequestDTO request);
}