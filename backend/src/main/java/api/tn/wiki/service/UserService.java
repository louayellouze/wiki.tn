package api.tn.wiki.service;

import api.tn.wiki.dto.request.ChangePasswordRequest;
import api.tn.wiki.dto.request.UserUpdateRequest;
import api.tn.wiki.entity.Role;
import api.tn.wiki.entity.User;
import api.tn.wiki.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username);
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public Page<User> getClients(Pageable pageable) {
        return userRepository.findByRole(Role.CLIENT, pageable);
    }

    public Page<User> searchUsers(String query, Pageable pageable) {
        return userRepository.searchUsers(query, pageable);
    }

    public Page<User> searchClients(String query, Pageable pageable) {
        return userRepository.searchUsersByRole(Role.CLIENT, query, pageable);
    }

    public Page<User> searchUsersByRole(Role role, String query, Pageable pageable) {
        return userRepository.searchUsersByRole(role, query, pageable);
    }

    public Page<User> getUsersByRole(Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getClients() {
        return userRepository.findByRole(Role.CLIENT);
    }

    public Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public User updateUser(Integer id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));

        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String newUsername = request.getUsername().trim();
            if (user.getUsername() == null || !newUsername.equals(user.getUsername())) {
                Optional<User> existing = userRepository.findByUsernameIgnoreCase(newUsername);
                if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                    throw new RuntimeException("Le nom d'utilisateur '" + newUsername + "' est déjà utilisé.");
                }
                user.setUsername(newUsername);
            }
        }
        
        // Only update email if it's provided and DIFFERENT from current email
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            if (user.getEmail() == null || !newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmailIgnoreCase(newEmail)) {
                    throw new RuntimeException("L'adresse email '" + newEmail + "' est déjà utilisée par un autre compte.");
                }
                user.setEmail(newEmail);
            }
        }
        
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getImageUrl() != null) user.setImageUrl(request.getImageUrl());
        
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid role
            }
        }

        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());
        
        return userRepository.save(user);
    }

    public boolean changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser().orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return true;
    }
}
