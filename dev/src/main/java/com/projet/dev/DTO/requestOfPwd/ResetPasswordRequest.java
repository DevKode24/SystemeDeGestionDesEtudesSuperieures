package com.projet.dev.DTO.requestOfPwd;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Builder
public class ResetPasswordRequest {

    @Schema(description = "Token de réinitialisation", example = "a1b2c3d4e5")
    @NotBlank
    private String token;

    @Schema(description = "Nouveau mot de passe", example = "NewPass123!")
    @Size(min = 8)
    @NotBlank
    private String newPassword;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
