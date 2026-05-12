package com.tourismgov.report.client.fallback;

import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;
import com.tourismgov.report.client.UserClient;
import com.tourismgov.report.dto.UserDTO;

@Component
public class UserClientFallback implements UserClient {
    @Override
    public List<UserDTO> getAllUsers() {
        return Collections.emptyList();
    }

    @Override
    public UserDTO getUserById(Long id) {
        UserDTO user = new UserDTO();
        user.setUserId(id);
        user.setName("Unknown User");
        return user;
    }
}
