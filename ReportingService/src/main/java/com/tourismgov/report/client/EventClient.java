package com.tourismgov.report.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.tourismgov.report.dto.EventDTO;

import java.util.List;

import com.tourismgov.report.client.fallback.EventClientFallback;

@FeignClient(name = "EVENTBOOKING-SERVICE", fallback = EventClientFallback.class)
public interface EventClient {
    @GetMapping("/tourismgov/v1/events")
    List<EventDTO> getAllEvents();
}
