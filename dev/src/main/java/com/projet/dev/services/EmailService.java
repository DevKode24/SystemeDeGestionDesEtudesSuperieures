package com.projet.dev.services;

import jakarta.mail.MessagingException;

public interface EmailService {
    void sendResetEmail(String toEmail, String token);
    void sendOtpEmail(String toEmail, String otp) throws MessagingException;

}
