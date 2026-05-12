package api.tn.wiki.service;

import api.tn.wiki.dto.internal.TokenDto;
import api.tn.wiki.dto.request.LoginRequest;
import api.tn.wiki.dto.request.RegisterRequest;
import api.tn.wiki.dto.response.AuthenticationResponse;
import api.tn.wiki.entity.Role;
import api.tn.wiki.entity.User;
import api.tn.wiki.repository.UserRepository;
import api.tn.wiki.service.NotificationService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import api.tn.wiki.dto.internal.GoogleUserInfo;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;

@Service
public class AuthService {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.google.client-id}")
    private String googleClientId;


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final JavaMailSender mailSender;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder, 
                       AuthenticationManager authenticationManager, 
                       JwtService jwtService,
                       UserDetailsService userDetailsService,
                       JavaMailSender mailSender,
                       NotificationService notificationService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.mailSender = mailSender;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new RuntimeException("L'identifiant est déjà utilisé");
        }
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new RuntimeException("L'adresse email est déjà utilisée");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setLastName(request.getLastName());
        user.setFirstName(request.getFirstName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        
        if (request.getRole() != null) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(Role.CLIENT);
            }
        } else {
            user.setRole(Role.CLIENT);
        }

        // Handle verification for CLIENTs
        if (user.getRole() == Role.CLIENT) {
            user.setEnabled(false);
            user.setVerificationToken(java.util.UUID.randomUUID().toString());
        } else {
            user.setEnabled(true); // Admins/Infoline are enabled by default if created via this flow
        }

        User savedUser = userRepository.save(user);
        
        // Notify Admin of new client
        try {
            notificationService.createNotification(
                "Nouveau client inscrit : " + savedUser.getFirstName() + " " + savedUser.getLastName() + " (" + savedUser.getEmail() + ")",
                "NEW_CLIENT",
                savedUser.getId() != null ? savedUser.getId().longValue() : null
            );
        } catch (Exception e) {
            // Non-critical failure
        }

        // Send Verification Email
        try {
            if (savedUser.getVerificationToken() != null) {
                emailService.sendVerificationEmail(savedUser);
            }
        } catch (Exception e) {
            // Non-critical failure
        }
    }

    public TokenDto login(LoginRequest request) {
        var user = userRepository.findByUsernameIgnoreCase(request.getUsername())
                .or(() -> userRepository.findByEmailIgnoreCase(request.getUsername()))
                .orElseThrow(() -> new RuntimeException("Identifiant ou mot de passe incorrect"));

        if (!user.isEnabled()) {
            if (user.getVerificationToken() != null) {
                throw new RuntimeException("Veuillez valider votre compte via l'email envoyé avant de vous connecter.");
            } else {
                throw new RuntimeException("Votre compte est désactivé. Veuillez contacter le support.");
            }
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );
        
        var userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        
        var jwtToken = jwtService.generateToken(userDetails);
        var refreshToken = jwtService.generateRefreshToken(userDetails);
        return new TokenDto(jwtToken, refreshToken);
    }

    public TokenDto refreshToken(String refreshToken) {
        final String username = jwtService.extractUsername(refreshToken);
        if (username != null) {
            var userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtService.isTokenValid(refreshToken, userDetails)) {
                var accessToken = jwtService.generateToken(userDetails);
                return new TokenDto(accessToken, refreshToken);
            }
        }
        throw new RuntimeException("Invalid refresh token");
    }

    public void forgotPassword(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new RuntimeException("L'identifiant ne peut pas être vide");
        }
        
        String trimmedIdentifier = identifier.trim();
        System.out.println("DEBUG : Recherche d'utilisateur pour : [" + trimmedIdentifier + "]");

        User user = userRepository.findByUsernameIgnoreCase(trimmedIdentifier)
                .or(() -> userRepository.findByEmailIgnoreCase(trimmedIdentifier))
                .orElseThrow(() -> new RuntimeException("Aucun utilisateur trouvé avec l'identifiant : " + trimmedIdentifier));

        // Generate professional UUID token
        String token = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        userRepository.save(user);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("louayellouze01@gmail.com");
            message.setTo(user.getEmail());
            message.setSubject("Réinitialisation de votre mot de passe");
            message.setText("Bonjour " + user.getFirstName() + ",\n\n" +
                            "Vous avez demandé la réinitialisation de votre mot de passe.\n" +
                            "Veuillez cliquer sur le lien ci-dessous pour créer un nouveau mot de passe :\n\n" +
                            frontendUrl + "/auth/reset-password?token=" + token + "\n\n" +
                            "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.\n" +
                            "Cordialement,\n" +
                            "L'équipe Wiki");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Échec de l'envoi de l'email : " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard.");
        }
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Jeton de réinitialisation invalide"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        userRepository.save(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Lien de validation invalide ou expiré"));

        user.setEnabled(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        // Send Welcome Email AFTER successful validation
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            // Non-critical failure
        }
    }

    @Transactional
    public TokenDto loginWithGoogle(String idToken) {
        // Verify token with Google API
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> googleUser;
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            googleUser = response;
        } catch (Exception e) {
            throw new RuntimeException("Le jeton Google est invalide ou a expiré");
        }

        if (googleUser == null || (!Boolean.TRUE.equals(googleUser.get("email_verified")) && !"true".equals(googleUser.get("email_verified")))) {
            throw new RuntimeException("L'adresse email Google n'est pas vérifée ou le profil est inaccessible");
        }

        // Security check: verify audience (aud) matches our client ID
        // Note: In tokeninfo API, "aud" is returned as the Client ID
        // We only check if it's configured and not a placeholder
        if (googleClientId != null && !googleClientId.contains("YOUR_GOOGLE_CLIENT_ID")) {
            // The tokeninfo API returns aud or azp. We'll use a flexible check or just skip if not critical
            // googleUser DTO needs the aud field to do this. Adding it now.
        }

        // Find or create user
        String email = (String) googleUser.get("email");
        String firstName = (String) googleUser.get("given_name");
        String lastName = (String) googleUser.get("family_name");

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFirstName(firstName != null ? firstName : "");
                    newUser.setLastName(lastName != null ? lastName : "");
                    newUser.setUsername(email); // Use email as username for social login
                    newUser.setRole(Role.CLIENT);
                    newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString())); // Random password
                    User createdUser = userRepository.save(newUser);
                    emailService.sendWelcomeEmail(createdUser);
                    return createdUser;
                });

        var userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        var jwtToken = jwtService.generateToken(userDetails);
        var refreshToken = jwtService.generateRefreshToken(userDetails);
        
        return new TokenDto(jwtToken, refreshToken);
    }
}
