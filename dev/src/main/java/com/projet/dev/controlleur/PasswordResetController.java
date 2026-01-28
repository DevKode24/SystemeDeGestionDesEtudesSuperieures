package com.projet.dev.controlleur;

import com.projet.dev.DTO.requestOfPwd.ForgotPasswordRequest;
import com.projet.dev.DTO.requestOfPwd.ResetPasswordRequest;
import com.projet.dev.DTO.requestOfPwd.VerifyOtpRequest;
import com.projet.dev.services.ServiceImpl.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Password Reset", description = "Endpoints pour la réinitialisation de mot de passe")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @Autowired
    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @Operation(
            summary = "Demander une réinitialisation",
            description = "Génère un OTP ou un lien de réinitialisation"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Email envoyé"),
            @ApiResponse(responseCode = "404", description = "Email non trouvé")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Email de l'utilisateur",
                    required = true
            )
            @Valid @RequestBody ForgotPasswordRequest request) {

        passwordResetService.initiateReset(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Vérifier OTP",
            description = "Valide un code OTP pour réinitialisation"
    )
    @PostMapping("/verify-otp")
    public ResponseEntity<Boolean> verifyOtp(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "OTP et email",
                    required = true
            )
            @Valid @RequestBody VerifyOtpRequest request) {

        boolean isValid = passwordResetService.validateOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(isValid);
    }

    @Operation(
            summary = "Réinitialiser le mot de passe",
            description = "Définit un nouveau mot de passe avec token valide"
    )
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Token et nouveau mot de passe",
                    required = true
            )
            @Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
