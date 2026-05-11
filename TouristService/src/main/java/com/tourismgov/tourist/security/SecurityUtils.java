package com.tourismgov.tourist.security;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
@Component
public class SecurityUtils {

    private static final String ANONYMOUS_USER = "anonymousUser";

    public void validateAccess(Long targetUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        var roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        // Staff bypass ID matching
        if (roles.contains("ROLE_ADMIN") || roles.contains("ROLE_OFFICER") || 
            roles.contains("ROLE_MANAGER") || roles.contains("ROLE_AUDITOR")) {
            return; 
        }

        // Tourists must match their own ID
        if (roles.contains("ROLE_TOURIST")) {
            // FIX: Use your helper method to get the actual Long ID!
            Long loggedInUserId = this.getCurrentUserId(); 
            
            if (!loggedInUserId.equals(targetUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: ID Mismatch");
            }
        } else {
            // TIP: If you still get 403 here, it means your JWT role is missing the "ROLE_" prefix.
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
        }
    }

    public void validateAdminOrStaff() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        var roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        boolean isStaff = roles.contains("ROLE_ADMIN") || roles.contains("ROLE_OFFICER") || 
                         roles.contains("ROLE_MANAGER") || roles.contains("ROLE_AUDITOR");

        if (!isStaff) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only staff can perform this action.");
        }
    }
    
    /**
     * Extracts the User ID passed down from the API Gateway header filter.
     * @return Long representing the current user ID
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 1. Check if the user is actually authenticated
        if (authentication == null || !authentication.isAuthenticated() || 
            ANONYMOUS_USER.equals(authentication.getPrincipal())) {
            
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, 
                "You must be logged in to perform this action."
            );
        }

        // 2. Safely extract the ID
        if (authentication.getPrincipal() instanceof Long userId) {
            return userId;
        } else if (authentication.getPrincipal() instanceof String userIdStr) {
             try {
                 return Long.parseLong(userIdStr);
             } catch (NumberFormatException e) {
                 throw new ResponseStatusException(
                     HttpStatus.INTERNAL_SERVER_ERROR, 
                     "Security context error: Invalid User ID format."
                 );
             }
        }

        // 3. Fallback error if the context got corrupted
        throw new ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR, 
            "Security context error: Could not verify user identity."
        );
    }
}