package com.tourismgov.report.client.fallback;

import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;
import com.tourismgov.report.client.EventClient;
import com.tourismgov.report.dto.EventDTO;

@Component
public class EventClientFallback implements EventClient {
    @Override
    public List<EventDTO> getAllEvents() {
        return Collections.emptyList();
    }
}
