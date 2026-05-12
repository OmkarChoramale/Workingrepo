package com.tourismgov.report.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.tourismgov.report.dto.ComplianceDTO;

import java.util.List;

import com.tourismgov.report.client.fallback.ComplianceClientFallback;

@FeignClient(name = "COMPLIANCE-SERVICE", fallback = ComplianceClientFallback.class)
public interface ComplianceClient {
    @GetMapping("/tourismgov/v1/compliance")
    List<ComplianceDTO> getAllComplianceRecords();
}
