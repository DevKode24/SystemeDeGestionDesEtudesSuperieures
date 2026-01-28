package com.projet.dev.DTO.requestOfPwd;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @Schema(description = "Email de l'utilisateur", example = "user@example.com")
        @Email @NotBlank String email
) {
    @Override
    public String email() {
        return email;
    }


    public String getEmail() {
        return email;
    }
}
