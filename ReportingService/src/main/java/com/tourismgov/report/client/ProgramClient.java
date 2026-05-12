package com.tourismgov.report.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.tourismgov.report.dto.ProgramDTO;

import java.util.List;

import com.tourismgov.report.client.fallback.ProgramClientFallback;

@FeignClient(name = "PROGRAM-SERVICE", fallback = ProgramClientFallback.class)
public interface ProgramClient {
    @GetMapping("/tourismgov/v1/programs")
    List<ProgramDTO> getAllPrograms();
}
