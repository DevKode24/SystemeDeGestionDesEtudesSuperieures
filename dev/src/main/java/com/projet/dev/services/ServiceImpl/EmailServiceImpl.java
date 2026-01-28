package com.projet.dev.services.ServiceImpl;

import com.projet.dev.services.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendResetEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Réinitialisation de votre mot de passe");
        message.setText("Pour réinitialiser votre mot de passe, utilisez ce token : " + token);
        mailSender.send(message);
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp) throws MessagingException {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Votre code OTP de réinitialisation");
        message.setText("Votre code OTP est : " + otp + ". Il est valide 5 minutes.");
        mailSender.send(message);
    }
}

