package com.tourismgov.notification.client.fallback;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Component;

import com.tourismgov.notification.client.UserClient;
import com.tourismgov.notification.dto.UserDTO;

@Component
public class UserClientFallback implements UserClient {

    @Override
    public UserDTO getUserById(Long id) {
        UserDTO fallbackUser = new UserDTO();
        fallbackUser.setUserId(id);
        fallbackUser.setName("Unknown User (Service Down)");
        fallbackUser.setEmail("unknown@tourismgov.com");
        return fallbackUser;
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return Collections.emptyList();
    }
}
