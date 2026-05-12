package com.tourismgov.report.client.fallback;

import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;
import com.tourismgov.report.client.BookingClient;
import com.tourismgov.report.dto.BookingDTO;

@Component
public class BookingClientFallback implements BookingClient {
    @Override
    public List<BookingDTO> getAllBookings() {
        return Collections.emptyList();
    }
}
