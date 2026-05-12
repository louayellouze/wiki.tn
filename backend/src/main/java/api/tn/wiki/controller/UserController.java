package api.tn.wiki.controller;

import api.tn.wiki.dto.request.ChangePasswordRequest;
import api.tn.wiki.dto.request.RegisterRequest;
import api.tn.wiki.dto.request.UserUpdateRequest;
import api.tn.wiki.dto.response.UserResponse;
import api.tn.wiki.entity.Role;
import api.tn.wiki.entity.User;
import api.tn.wiki.service.AuthService;
import api.tn.wiki.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        User user = userService.getCurrentUser().orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(convertToResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody UserUpdateRequest request) {
        User user = userService.getCurrentUser().orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            // Prevent users from changing their own role or status via this endpoint
            request.setRole(null);
            request.setEnabled(null);
            
            User updated = userService.updateUser(user.getId(), request);
            return ResponseEntity.ok(convertToResponse(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An internal error occurred: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @PageableDefault(size = 10, sort = "firstName") Pageable pageable) {
        if (!hasPrivilegedAccess()) {
            return ResponseEntity.status(403).build();
        }

        try {
            Page<User> rawUsers;
            if (search != null && !search.trim().isEmpty()) {
                if (isInfoline() && !isAdmin()) {
                    rawUsers = userService.searchClients(search.trim(), pageable);
                } else if (role != null) {
                    rawUsers = userService.searchUsersByRole(role, search.trim(), pageable);
                } else {
                    rawUsers = userService.searchUsers(search.trim(), pageable);
                }
            } else {
                if (isInfoline() && !isAdmin()) {
                    rawUsers = userService.getClients(pageable);
                } else if (role != null) {
                    rawUsers = userService.getUsersByRole(role, pageable);
                } else {
                    rawUsers = userService.getAllUsers(pageable);
                }
            }

            Page<UserResponse> users = rawUsers.map(u -> new UserResponse(
                            u.getId(),
                            u.getUsername(),
                            u.getEmail(),
                            u.getLastName(),
                            u.getFirstName(),
                            u.getAddress(),
                            u.getPhone(),
                            u.getRole() != null ? u.getRole().name() : "CLIENT",
                            u.getImageUrl(),
                            u.isEnabled()
                    ));
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/clients")
    public ResponseEntity<?> getClients(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "firstName") Pageable pageable) {
        if (!hasPrivilegedAccess()) {
            return ResponseEntity.status(403).build();
        }
        try {
            Page<User> rawUsers;
            if (search != null && !search.trim().isEmpty()) {
                rawUsers = userService.searchClients(search.trim(), pageable);
            } else {
                rawUsers = userService.getClients(pageable);
            }
            
            Page<UserResponse> users = rawUsers.map(u -> new UserResponse(
                            u.getId(),
                            u.getUsername(),
                            u.getEmail(),
                            u.getLastName(),
                            u.getFirstName(),
                            u.getAddress(),
                            u.getPhone(),
                            u.getRole() != null ? u.getRole().name() : "CLIENT",
                            u.getImageUrl(),
                            u.isEnabled()
                    ));
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody RegisterRequest request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied: Admin role required"));
        }

        try {
            authService.register(request);
            return ResponseEntity.ok(Map.of("message", "User created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creating user: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        Integer userId;
        if ("undefined".equals(id)) {
            User user = userService.getCurrentUser().orElse(null);
            if (user == null) return ResponseEntity.status(401).build();
            return ResponseEntity.ok(convertToResponse(user));
        } else {
            try {
                userId = Integer.parseInt(id);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        User user = userService.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(convertToResponse(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest request) {
        Integer userId;
        if ("undefined".equals(id)) {
            User currentUser = userService.getCurrentUser().orElse(null);
            if (currentUser == null) return ResponseEntity.status(401).build();
            userId = currentUser.getId();
        } else {
            try {
                userId = Integer.parseInt(id);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid User ID format."));
            }
        }

        // Admin or the user themselves can update
        User currentUser = userService.getCurrentUser().orElse(null);
        if (currentUser == null) return ResponseEntity.status(401).build();

        User targetUser = userService.findById(userId).orElse(null);
        if (targetUser == null) return ResponseEntity.notFound().build();

        boolean isSelf = currentUser.getId().equals(userId);
        boolean isTargetClient = targetUser.getRole() == Role.CLIENT;
        
        boolean canUpdate = isAdmin() || isSelf || (isInfoline() && isTargetClient);
        
        if (!canUpdate) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied: You do not have permission to update this profile."));
        }

        try {
            // Security: Prevent non-admins from changing roles or status
            if (!isAdmin()) {
                request.setRole(null);
                request.setEnabled(null);
            }
            
            // Allow username change if admin or self
            if (!isAdmin() && !isSelf) {
                request.setUsername(null);
            }
            
            User updated = userService.updateUser(userId, request);
            return ResponseEntity.ok(convertToResponse(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An internal error occurred: " + e.getMessage()));
        }
    }

    private UserResponse convertToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getLastName(),
                user.getFirstName(),
                user.getAddress(),
                user.getPhone(),
                user.getRole() != null ? user.getRole().name() : "CLIENT",
                user.getImageUrl(),
                user.isEnabled()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied: Admin role required"));
        }

        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting user: " + e.getMessage()));
        }
    }

    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            boolean success = userService.changePassword(request);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid old password"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error changing password: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Integer id) {
        User targetUser = userService.findById(id).orElse(null);
        boolean isTargetClient = targetUser != null && ("CLIENT".equals(targetUser.getRole().name()));

        if (!isAdmin() && !(isInfoline() && isTargetClient)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied: Admin role required or client-only access for Infoline"));
        }

        try {
            User user = userService.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            UserUpdateRequest request = new UserUpdateRequest();
            request.setEnabled(!user.isEnabled());
            User updated = userService.updateUser(id, request);
            return ResponseEntity.ok(Map.of(
                "message", "User status updated successfully",
                "enabled", updated.isEnabled()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error updating user status: " + e.getMessage()));
        }
    }

    private boolean isAdmin() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
    }

    private boolean isInfoline() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_INFOLINE") || a.getAuthority().equals("INFOLINE"));
    }

    private boolean hasPrivilegedAccess() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> 
                    a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN") ||
                    a.getAuthority().equals("ROLE_WEBMASTER") || a.getAuthority().equals("WEBMASTER") ||
                    a.getAuthority().equals("ROLE_INFOLINE") || a.getAuthority().equals("INFOLINE")
                );
    }
}
