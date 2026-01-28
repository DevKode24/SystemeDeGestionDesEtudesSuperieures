package com.projet.dev.services.ServiceImpl;

import com.projet.dev.models.User;
import com.projet.dev.repository.UserRepository;
import com.projet.dev.security.jwt.token.InvalidTokenException;
import com.projet.dev.security.jwt.token.PasswordResetToken;
import com.projet.dev.security.jwt.token.PasswordResetTokenRepository;
import com.projet.dev.security.jwt.token.TokenExpiredException;
import com.projet.dev.services.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @Autowired
    public PasswordResetService(UserRepository userRepository, PasswordResetTokenRepository tokenRepository, EmailService emailService, PasswordEncoder passwordEncoder, OtpService otpService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
    }

    public void initiateReset(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken(
                token,
                user,
                LocalDateTime.now().plusMinutes(15)
        );

        tokenRepository.save(resetToken);
        emailService.sendResetEmail(user.getEmail(), token);
    }

    public void sendOtp(String email) throws MessagingException {
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);
    }

    public boolean validateOtp(String email, String otp) {
        return otpService.validateOtp(email, otp);
    }

    public void resetPassword(String token, String newPassword) {

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token invalide"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Token expiré");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }
}
