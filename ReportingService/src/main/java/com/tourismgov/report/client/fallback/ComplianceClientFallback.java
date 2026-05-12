package com.tourismgov.report.client.fallback;

import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;
import com.tourismgov.report.client.ComplianceClient;
import com.tourismgov.report.dto.ComplianceDTO;

@Component
public class ComplianceClientFallback implements ComplianceClient {
    @Override
    public List<ComplianceDTO> getAllComplianceRecords() {
        return Collections.emptyList();
    }
}
