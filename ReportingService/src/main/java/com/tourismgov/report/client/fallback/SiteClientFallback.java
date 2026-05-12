package com.tourismgov.report.client.fallback;

import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;
import com.tourismgov.report.client.SiteClient;
import com.tourismgov.report.dto.SiteDTO;

@Component
public class SiteClientFallback implements SiteClient {
    @Override
    public List<SiteDTO> getAllSites() {
        return Collections.emptyList();
    }
}
