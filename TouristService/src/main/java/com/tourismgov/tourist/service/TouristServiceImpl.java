package com.tourismgov.tourist.service;

import java.time.LocalDate;
import java.time.Period;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.tourismgov.tourist.client.NotificationClient;
import com.tourismgov.tourist.client.UserClient;
import com.tourismgov.tourist.dto.TouristRequest;
import com.tourismgov.tourist.dto.TouristResponse;
import com.tourismgov.tourist.dto.TouristSummaryResponse;
import com.tourismgov.tourist.dto.TouristUpdateRequest;
import com.tourismgov.tourist.dto.NotificationRequestDTO; // ✅ Added
import com.tourismgov.tourist.dto.UserDTO;
import com.tourismgov.tourist.enums.Status;
import com.tourismgov.tourist.exception.TouristErrorMessage;
import com.tourismgov.tourist.mapper.TouristMapper;
import com.tourismgov.tourist.model.Tourist;
import com.tourismgov.tourist.repository.TouristRepository;
import com.tourismgov.tourist.security.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TouristServiceImpl implements TouristService {

    private final TouristRepository touristRepository;
    private final TouristMapper touristMapper;
    private final UserClient userClient;
    private final SecurityUtils securityUtils;
    private final NotificationClient notificationClient;

    @Override
    @Transactional
    public TouristResponse createTourist(TouristRequest request) {
        log.info("Starting Dual Registration for: {}", request.getEmail());

        Tourist tourist = touristMapper.toTouristEntity(request, null);
        validateAdult(tourist);

        UserDTO newUserRequest = touristMapper.toUserDTO(request);
        UserDTO savedUser = userClient.registerUser(newUserRequest);

        if (savedUser != null && savedUser.getUserId() != null && savedUser.getUserId() == -1L) {
            log.error("Aborting Tourist creation because USER-SERVICE is down.");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Registration service is temporarily down. Please try again later.");
        }

        log.info("User created successfully with ID: {}", savedUser.getUserId());

        tourist.setUserId(savedUser.getUserId()); 
        
        Tourist savedTourist = touristRepository.save(tourist);

        // ✅ Notification: Send targeted welcome notification after successful save
        String message = "Your registration was successful. Welcome aboard, " + savedUser.getName() + "!";
        sendNotificationSafe(
            savedUser.getUserId(),    // Recipient ID from User Service
            savedTourist.getTouristId(), // Reference Entity ID
            "Welcome to TourismGov!", 
            message, 
            "SYSTEM_CREATE"
        );

        return touristMapper.toResponse(savedTourist);
    }

    @Override
    public TouristResponse getTouristById(Long userId) {
        log.info("Fetching tourist profile for user ID: {}", userId);
        Tourist tourist = findTouristByUserIdOrThrow(userId);
        securityUtils.validateAccess(tourist.getUserId());
        
        log.info("Tourist {} fetched successfully", userId);
        return touristMapper.toResponse(tourist);
    }

    @Override
    @Transactional
    public TouristResponse updateTourist(Long userId, TouristUpdateRequest request) {
        log.info("Updating tourist profile for user ID: {}", userId);
        Tourist tourist = findTouristByUserIdOrThrow(userId);
        securityUtils.validateAccess(tourist.getUserId());
        
        touristMapper.updateEntityFromRequest(request, tourist);
        validateAdult(tourist);

        tourist = touristRepository.save(tourist);
        log.info("Tourist ID {} updated successfully", userId);

        return touristMapper.toResponse(tourist);
    }

    @Override
    @Transactional
    public void deleteTourist(Long touristId) {
        log.info("Attempting to delete tourist profile for user ID: {}", touristId);
        Tourist tourist = touristRepository.findById(touristId).orElseThrow(() -> {
            log.error("Tourist {} not found", touristId);
            return new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format(TouristErrorMessage.ERROR_TOURIST_NOT_FOUND, touristId));
        });

        touristRepository.delete(tourist);
        log.info("Tourist {} deleted successfully", touristId);
    }

    @Override
    public Page<TouristSummaryResponse> getTouristSummariesByStatus(Status status, Pageable pageable) {
        securityUtils.validateAdminOrStaff();
        Page<Tourist> page = (status != null) ? touristRepository.findByStatus(status, pageable)
                : touristRepository.findAll(pageable);
        log.info("Fetched {} tourist records", page.getTotalElements());
        return page.map(t -> new TouristSummaryResponse(t.getTouristId(), t.getName(), t.getStatus()));
    }

    private Tourist findTouristByUserIdOrThrow(Long userId) {
        return touristRepository.findByUserId(userId).orElseThrow(() -> {
            log.error("Tourist profile not found for user ID: {}", userId);
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "No tourist profile found for the current user");
        });
    }

    private void validateAdult(Tourist tourist) {
        if (tourist.getDob() != null && Period.between(tourist.getDob(), LocalDate.now()).getYears() < 18) {
            log.error("Tourist {} is under 18 years old", tourist.getName());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, TouristErrorMessage.ERROR_UNDERAGE_TOURIST);
        }
    }

    // ✅ ADDED: Private Helper Method for DTO-based Private Notification
    private void sendNotificationSafe(Long userId, Long entityId, String subject, String message, String category) {
        try {
            NotificationRequestDTO notificationReq = NotificationRequestDTO.builder()
                    .userId(userId)        // The user receiving the notification
                    .entityId(entityId)    // ID of the related Tourist record
                    .subject(subject)
                    .message(message)
                    .category(category)
                    .build();

            notificationClient.createNotification(notificationReq);
            log.info("Welcome notification sent successfully to userId: {}", userId);
        } catch (Exception e) {
            // Fault-tolerance: Registration succeeds even if the notification fails
            log.error("Failed to push welcome notification: {}", e.getMessage());
        }
    }
}