package com.projet.dev.DTO.requestOfPwd;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class VerifyOtpRequest {

    @Schema(description = "Email de l'utilisateur", example = "user@example.com")
    @Email
    @NotBlank
    private String email;

    @Schema(description = "Code OTP", example = "123456")
    @NotBlank
    private String otp;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
