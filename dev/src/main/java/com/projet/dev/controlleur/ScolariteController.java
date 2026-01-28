package com.projet.dev.controlleur;

import com.projet.dev.DTO.ScolariteDto;
import com.projet.dev.services.ScolariteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/scolarites")
@Tag(name = "Scolarité", description = "Gestion des utilisateurs Scolarité")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
public class ScolariteController {

    private final ScolariteService scolariteService;

    public ScolariteController(ScolariteService scolariteService) {
        this.scolariteService = scolariteService;
    }

    /* ==========================
       CRÉATION SCOLARITÉ
       ========================== */
    @PostMapping
    @Operation(summary = "Ajouter un utilisateur Scolarité", description = "Crée un nouvel utilisateur Scolarité")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Utilisateur Scolarité créé"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<ScolariteDto> creerScolarite(@Valid @RequestBody ScolariteDto dto) {
        return ResponseEntity.ok(scolariteService.creerScolarite(dto));
    }

    /* ==========================
       MODIFICATION SCOLARITÉ
       ========================== */
    @PutMapping("/{id}")
    @Operation(summary = "Modifier un utilisateur Scolarité", description = "Met à jour les informations d’un utilisateur Scolarité existant")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Utilisateur modifié"),
            @ApiResponse(responseCode = "404", description = "Utilisateur introuvable")
    })
    public ResponseEntity<ScolariteDto> modifierScolarite(@PathVariable Long id, @Valid @RequestBody ScolariteDto dto) {
        return ResponseEntity.ok(scolariteService.modifierScolarite(id, dto));
    }

    /* ==========================
       CONSULTATION SCOLARITÉ
       ========================== */
    @GetMapping("/{id}")
    @Operation(summary = "Consulter un utilisateur Scolarité", description = "Retourne les informations d’un utilisateur Scolarité par son ID")
    public ResponseEntity<ScolariteDto> getScolariteById(@PathVariable Long id) {
        return ResponseEntity.ok(scolariteService.getScolariteById(id));
    }

    @GetMapping("/email")
    @Operation(summary = "Consulter un utilisateur Scolarité par email", description = "Retourne les informations d’un utilisateur Scolarité par son email")
    public ResponseEntity<ScolariteDto> getScolariteByEmail(@RequestParam String email) {
        return ResponseEntity.ok(scolariteService.getScolariteByEmail(email));
    }

    @GetMapping
    @Operation(summary = "Lister tous les utilisateurs Scolarité", description = "Retourne la liste complète des utilisateurs Scolarité")
    public ResponseEntity<List<ScolariteDto>> listerToutesScolarites() {
        return ResponseEntity.ok(scolariteService.listerToutesScolarites());
    }
}
