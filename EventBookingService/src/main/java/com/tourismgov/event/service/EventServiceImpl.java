package com.tourismgov.event.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourismgov.event.client.NotificationClient;
import com.tourismgov.event.client.ProgramClient;
import com.tourismgov.event.client.SiteClient;
import com.tourismgov.event.client.UserClient;
import com.tourismgov.event.dto.AuditLogRequest;
import com.tourismgov.event.dto.CreateEventRequest;
import com.tourismgov.event.dto.EventResponse;
import com.tourismgov.event.dto.NotificationRequestDTO;
import com.tourismgov.event.dto.ProgramDto;
import com.tourismgov.event.dto.UpdateEventStatusRequest;
import com.tourismgov.event.entity.Event;
import com.tourismgov.event.enums.EventStatus;
import com.tourismgov.event.exceptions.ErrorMessages;
import com.tourismgov.event.exceptions.ResourceNotFoundException;
import com.tourismgov.event.repository.EventRepository;
import com.tourismgov.event.security.SecurityUtils;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventServiceImpl implements EventService {

    private static final String RESOURCE_EVENT = "EventService";
    private static final String ENTITY_NAME = "Event";
    private static final String ENTITY_SITE = "Heritage Site";
    private static final String ENTITY_PROGRAM = "Tourism Program";
    
    private static final String ACTION_EVENT_CREATE = "EVENT_CREATE";
    private static final String ACTION_EVENT_UPDATE = "EVENT_UPDATE";
    private static final String ACTION_EVENT_STATUS_UPDATE = "EVENT_STATUS_UPDATE";
    private static final String ACTION_EVENT_DELETE = "EVENT_DELETE";
    
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";

    private final EventRepository eventRepository;
    private final UserClient userClient; 
    private final NotificationClient notificationClient;
    private final SiteClient siteClient;       
    private final ProgramClient programClient; 

    @Override
    @Transactional
    public EventResponse createEvent(CreateEventRequest request) {
        log.info("Creating event: {}", request.getTitle());
        Long currentUserId = SecurityUtils.getCurrentUserId();

        if (eventRepository.existsByTitleAndSiteIdAndDate(request.getTitle(), request.getSiteId(), request.getDate())) {
            logAuditSafe(currentUserId, ACTION_EVENT_CREATE, RESOURCE_EVENT, STATUS_FAILED);
            throw new IllegalStateException("An event with this title is already scheduled at this site for the given date.");
        }

        validateSiteAndProgram(request.getSiteId(), request.getProgramId(), request.getDate());

        Event event = new Event();
        event.setSiteId(request.getSiteId()); 
        event.setTitle(request.getTitle());
        event.setLocation(request.getLocation());
        event.setDate(request.getDate());
        event.setStatus(request.getStatus() != null ? request.getStatus() : EventStatus.SCHEDULED);
        event.setProgramId(request.getProgramId());

        Event saved = eventRepository.save(event);
        logAuditSafe(currentUserId, ACTION_EVENT_CREATE, RESOURCE_EVENT, STATUS_SUCCESS);
                
        // ✅ Global Broadcast: New Event
        try {
            String message = String.format("A new event '%s' has been scheduled at %s on %s.", 
                    saved.getTitle(), saved.getLocation(), saved.getDate().toLocalDate());
            
            notificationClient.sendGlobalBroadcast(NotificationRequestDTO.builder()
                    .userId(currentUserId)
                    .entityId(saved.getEventId())
                    .subject("New Event Scheduled!")
                    .message(message)
                    .category("EVENT")
                    .build());
        } catch (Exception e) {
            log.error("Global broadcast failed during creation: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long eventId, CreateEventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(ENTITY_NAME, eventId));
        
        Long currentUserId = SecurityUtils.getCurrentUserId();

        if (eventRepository.existsByTitleAndSiteIdAndDateAndEventIdNot(
                request.getTitle(), request.getSiteId(), request.getDate(), eventId)) {
            logAuditSafe(currentUserId, ACTION_EVENT_UPDATE, RESOURCE_EVENT, STATUS_FAILED);
            throw new IllegalStateException("Another event title conflict on this date.");
        }

        validateSiteAndProgram(request.getSiteId(), request.getProgramId(), request.getDate());

        event.setTitle(request.getTitle());
        event.setLocation(request.getLocation());
        event.setDate(request.getDate());
        event.setSiteId(request.getSiteId()); 
        event.setProgramId(request.getProgramId());
        if (request.getStatus() != null) event.setStatus(request.getStatus());

        Event updatedEvent = eventRepository.save(event);
        logAuditSafe(currentUserId, ACTION_EVENT_UPDATE, RESOURCE_EVENT, STATUS_SUCCESS);

        // ✅ Global Broadcast: Updated Event
        try {
            String message = String.format("Event '%s' details have been updated.", updatedEvent.getTitle());
            notificationClient.sendGlobalBroadcast(NotificationRequestDTO.builder()
                    .userId(currentUserId)
                    .entityId(updatedEvent.getEventId())
                    .subject("Event Details Updated")
                    .message(message)
                    .category("EVENT")
                    .build());
        } catch (Exception e) {
            log.warn("Global broadcast failed during update: {}", e.getMessage());
        }
        
        return mapToResponse(updatedEvent);
    }
    
    @Override
    @Transactional
    public EventResponse updateEventStatus(Long eventId, UpdateEventStatusRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(ENTITY_NAME, eventId));
        
        if (request.getStatus() != null) {
            event.setStatus(EventStatus.valueOf(request.getStatus().toString())); 
        }

        Event updatedEvent = eventRepository.save(event);
        logAuditSafe(SecurityUtils.getCurrentUserId(), ACTION_EVENT_STATUS_UPDATE, RESOURCE_EVENT, STATUS_SUCCESS);
        
        // ❌ NOTIFICATION REMOVED AS PER REQUEST
        
        return mapToResponse(updatedEvent);
    }

    @Override
    @Transactional
    public void cancelEventsByProgram(Long programId) {
        log.info(">>>> [EVENT-SERVICE] Cancelling events for Program ID: {}", programId);
        List<Event> events = eventRepository.findByProgramId(programId);

        if (events == null || events.isEmpty()) return;

        events.forEach(event -> event.setStatus(EventStatus.CANCELLED));
        eventRepository.saveAll(events);

        // ❌ NOTIFICATION REMOVED AS PER REQUEST
    }
    
    @Override
    public EventResponse getEventById(Long eventId) {
        return eventRepository.findById(eventId).map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException(ENTITY_NAME, eventId));
    }

    @Override
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<EventResponse> getEventsBySite(Long siteId) {
        return eventRepository.findBySiteId(siteId).stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<EventResponse> getEventsByProgram(Long programId) {
        return eventRepository.findByProgramId(programId).stream().map(this::mapToResponse).toList();
    }

    @Override
    public Page<EventResponse> getEventsPaged(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (status != null && !status.isBlank()) {
            try {
                EventStatus statusEnum = EventStatus.valueOf(status.toUpperCase());
                return eventRepository.findByStatus(statusEnum, pageable).map(this::mapToResponse);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(ErrorMessages.INVALID_STATUS);
            }
        }
        return eventRepository.findAll(pageable).map(this::mapToResponse); 
    }

    @Override
    @Transactional
    public void deleteEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException(ENTITY_NAME, eventId);
        }
        eventRepository.deleteById(eventId);
        logAuditSafe(SecurityUtils.getCurrentUserId(), ACTION_EVENT_DELETE, RESOURCE_EVENT, STATUS_SUCCESS);
        // ❌ NOTIFICATION REMOVED AS PER REQUEST
    }

    // --- Private Helper Methods ---

    private void validateSiteAndProgram(Long siteId, Long programId, LocalDateTime eventDate) {
        if (siteId != null) {
            try {
                siteClient.getSiteById(siteId);
            } catch (FeignException.NotFound e) {
                throw new ResourceNotFoundException(ENTITY_SITE, siteId);
            } catch (Exception e) {
                throw new RuntimeException(ErrorMessages.SITE_SERVICE_ERROR, e);
            }
        }

        if (programId != null) {
            try {
                ProgramDto program = programClient.getProgramById(programId);
                if (eventDate != null) {
                    LocalDate eDate = eventDate.toLocalDate();
                    if (eDate.isBefore(program.getStartDate()) || eDate.isAfter(program.getEndDate())) {
                        throw new IllegalArgumentException(String.format(ErrorMessages.EVENT_DATE_OUT_OF_BOUNDS,
                                eDate, program.getStartDate(), program.getEndDate()));
                    }
                }
            } catch (FeignException.NotFound e) {
                throw new ResourceNotFoundException(ENTITY_PROGRAM, programId);
            } catch (Exception e) {
                if (e instanceof IllegalArgumentException) throw e;
                throw new RuntimeException(ErrorMessages.PROGRAM_SERVICE_ERROR, e);
            }
        }
    }

    private void sendNotificationSafe(Long userId, Long entityId, String subject, String message, String category) {
        try {
            notificationClient.createNotification(NotificationRequestDTO.builder()
                    .userId(userId) 
                    .entityId(entityId)
                    .subject(subject)
                    .message(message)
                    .category(category)
                    .build());
            log.info("Private notification sent to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to push notification: {}", e.getMessage());
        }
    }

    private EventResponse mapToResponse(Event event) {
        EventResponse response = new EventResponse();
        response.setEventId(event.getEventId());
        response.setSiteId(event.getSiteId()); 
        response.setProgramId(event.getProgramId());
        response.setTitle(event.getTitle());
        response.setLocation(event.getLocation());
        response.setDate(event.getDate());
        if (event.getStatus() != null) response.setStatus(event.getStatus().name());
        return response;
    }

    private void logAuditSafe(Long userId, String action, String resource, String status) {
        try {
            AuditLogRequest auditRequest = new AuditLogRequest();
            auditRequest.setUserId(userId);
            auditRequest.setAction(action);
            auditRequest.setResource(resource);
            auditRequest.setStatus(status);
            userClient.logAction(auditRequest);
        } catch (Exception e) {
            log.error("Audit log push failed: {}", e.getMessage());
        }
    }
}