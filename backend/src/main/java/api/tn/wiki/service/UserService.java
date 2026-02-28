package api.tn.wiki.service;

import api.tn.wiki.dto.request.ChangePasswordRequest;
import api.tn.wiki.dto.request.UserUpdateRequest;
import api.tn.wiki.entity.Role;
import api.tn.wiki.entity.User;
import api.tn.wiki.repository.UserRepository;
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

    public User updateUser(Integer id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
                throw new RuntimeException("Email is already in use by another user");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getImageUrl() != null) user.setImageUrl(request.getImageUrl());
        
        if (request.getRole() != null) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Ignore or log invalid role
            }
        }

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
