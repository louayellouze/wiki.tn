package api.tn.wiki.controller;

import api.tn.wiki.dto.request.ChangePasswordRequest;
import api.tn.wiki.dto.request.RegisterRequest;
import api.tn.wiki.dto.request.UserUpdateRequest;
import api.tn.wiki.dto.response.UserResponse;
import api.tn.wiki.entity.User;
import api.tn.wiki.service.AuthService;
import api.tn.wiki.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
    public ResponseEntity<User> getCurrentUser() {
        return userService.getCurrentUser()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        if (!hasPrivilegedAccess()) {
            return ResponseEntity.status(403).body("Access Denied: privileged role required");
        }

        try {
            System.out.println("DEBUG: Starting getAllUsers manually...");
            
            List<User> rawUsers;
            if (isInfoline() && !isAdmin()) {
                // Infoline can only see users with the CLIENT role
                rawUsers = userService.getClients();
            } else {
                // Admin and Webmaster can see all users
                rawUsers = userService.getAllUsers();
            }

            List<UserResponse> users = rawUsers.stream()
                    .map(u -> new UserResponse(
                            u.getId(),
                            u.getUsername(),
                            u.getEmail(),
                            u.getLastName(),
                            u.getFirstName(),
                            u.getAddress(),
                            u.getPhone(),
                            u.getRole() != null ? u.getRole().name() : "CLIENT"
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/clients")
    public ResponseEntity<?> getClients() {
        if (!hasPrivilegedAccess()) {
            return ResponseEntity.status(403).body("Access Denied: Privileged role required");
        }
        try {
            List<User> rawUsers = userService.getClients();
            List<UserResponse> users = rawUsers.stream()
                    .map(u -> new UserResponse(
                            u.getId(),
                            u.getUsername(),
                            u.getEmail(),
                            u.getLastName(),
                            u.getFirstName(),
                            u.getAddress(),
                            u.getPhone(),
                            u.getRole().name()
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching clients: " + e.getMessage());
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
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        return userService.findById(id)
                .map(u -> new UserResponse(
                        u.getId(),
                        u.getUsername(),
                        u.getEmail(),
                        u.getLastName(),
                        u.getFirstName(),
                        u.getAddress(),
                        u.getPhone(),
                        u.getRole() != null ? u.getRole().name() : "CLIENT"
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody UserUpdateRequest request) {
        // Admin or the user themselves can update
        User currentUser = userService.getCurrentUser().orElse(null);
        if (currentUser == null) return ResponseEntity.status(401).build();

        boolean isSelf = currentUser.getId().equals(id);
        if (!isAdmin() && !isSelf) {
            return ResponseEntity.status(403).body("Access Denied: You can only update your own profile");
        }

        try {
            User updated = userService.updateUser(id, request);
            return ResponseEntity.ok(new UserResponse(
                    updated.getId(),
                    updated.getUsername(),
                    updated.getEmail(),
                    updated.getLastName(),
                    updated.getFirstName(),
                    updated.getAddress(),
                    updated.getPhone(),
                    updated.getRole() != null ? updated.getRole().name() : "CLIENT"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating user: " + e.getMessage());
        }
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
