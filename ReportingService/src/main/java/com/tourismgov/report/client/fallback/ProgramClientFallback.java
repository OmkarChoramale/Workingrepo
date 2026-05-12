package com.tourismgov.report.client.fallback;

import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;
import com.tourismgov.report.client.ProgramClient;
import com.tourismgov.report.dto.ProgramDTO;

@Component
public class ProgramClientFallback implements ProgramClient {
    @Override
    public List<ProgramDTO> getAllPrograms() {
        return Collections.emptyList();
    }
}
