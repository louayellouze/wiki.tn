package api.tn.wiki.service;

import api.tn.wiki.dto.internal.TokenDto;
import api.tn.wiki.dto.request.LoginRequest;
import api.tn.wiki.dto.request.RegisterRequest;
import api.tn.wiki.dto.response.AuthenticationResponse;
import api.tn.wiki.entity.Role;
import api.tn.wiki.entity.User;
import api.tn.wiki.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final JavaMailSender mailSender;

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder, 
                       AuthenticationManager authenticationManager, 
                       JwtService jwtService,
                       UserDetailsService userDetailsService,
                       JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.mailSender = mailSender;
    }

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

        userRepository.save(user);
    }

    public TokenDto login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        
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
                            "http://localhost:3000/auth/reset-password?token=" + token + "\n\n" +
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
}
