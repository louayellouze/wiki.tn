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
    public ResponseEntity<UserResponse> getCurrentUser() {
        User user = userService.getCurrentUser().orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        UserResponse resp = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getLastName(),
                user.getFirstName(),
                user.getAddress(),
                user.getPhone(),
                user.getRole() != null ? user.getRole().name() : "CLIENT",
                user.getImageUrl()
        );
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        if (!hasPrivilegedAccess()) {
            return ResponseEntity.status(403).build();
        }

        try {
            List<User> rawUsers;
            if (isInfoline() && !isAdmin()) {
                rawUsers = userService.getClients();
            } else {
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
                            u.getRole() != null ? u.getRole().name() : "CLIENT",
                            u.getImageUrl()
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/clients")
    public ResponseEntity<List<UserResponse>> getClients() {
        if (!hasPrivilegedAccess()) {
            return ResponseEntity.status(403).build();
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
                            u.getRole() != null ? u.getRole().name() : "CLIENT",
                            u.getImageUrl()
                    ))
                    .collect(Collectors.toList());
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
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer id) {
        User user = userService.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        UserResponse resp = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getLastName(),
                user.getFirstName(),
                user.getAddress(),
                user.getPhone(),
                user.getRole() != null ? user.getRole().name() : "CLIENT",
                user.getImageUrl()
        );
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Integer id, @RequestBody UserUpdateRequest request) {
        // Admin or the user themselves can update
        User currentUser = userService.getCurrentUser().orElse(null);
        if (currentUser == null) return ResponseEntity.status(401).build();

        boolean isSelf = currentUser.getId().equals(id);
        if (!isAdmin() && !isSelf) {
            return ResponseEntity.status(403).build();
        }

        try {
            User updated = userService.updateUser(id, request);
            UserResponse resp = new UserResponse(
                    updated.getId(),
                    updated.getUsername(),
                    updated.getEmail(),
                    updated.getLastName(),
                    updated.getFirstName(),
                    updated.getAddress(),
                    updated.getPhone(),
                    updated.getRole() != null ? updated.getRole().name() : "CLIENT",
                    updated.getImageUrl()
            );
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
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
