package com.projet.dev.services.ServiceImpl;

import com.projet.dev.repository.OtpCodeRepository;
import com.projet.dev.security.auth.OtpCode;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;

    // ✅ Constructeur explicite (OBLIGATOIRE)
    public OtpService(OtpCodeRepository otpCodeRepository) {
        this.otpCodeRepository = otpCodeRepository;
    }

    private static final int OTP_VALID_DURATION_MINUTES = 5;

    public String generateOtp(String email) {

        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        otpCodeRepository.deleteByEmail(email);

        OtpCode otpCode = new OtpCode(
                email,
                otp,
                LocalDateTime.now().plusMinutes(OTP_VALID_DURATION_MINUTES)
        );

        otpCodeRepository.save(otpCode);
        return otp;
    }

    public boolean validateOtp(String email, String otp) {

        Optional<OtpCode> otpCodeOpt =
                otpCodeRepository.findByEmailAndCode(email, otp);

        if (otpCodeOpt.isEmpty()) {
            return false;
        }

        OtpCode otpCode = otpCodeOpt.get();

        if (otpCode.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        otpCodeRepository.delete(otpCode);
        return true;
    }
}
