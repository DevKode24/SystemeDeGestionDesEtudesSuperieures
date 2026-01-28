package com.projet.dev.controlleur;

import com.projet.dev.DTO.FiliereDto;
import com.projet.dev.services.FiliereService;
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
@RequestMapping("/api/v1/admin/filieres")
@Tag(name = "Filière", description = "Gestion des filières académiques")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
public class FiliereController {

    private final FiliereService filiereService;

    public FiliereController(FiliereService filiereService) {
        this.filiereService = filiereService;
    }

    /* ====================
       CRÉATION FILIÈRE
       ==================== */

    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @PostMapping
    @Operation(
            summary = "Créer une filière",
            description = "Ajoute une nouvelle filière académique"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Filière créée"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<FiliereDto> creerFiliere(
            @Valid @RequestBody FiliereDto dto
    ) {
        return ResponseEntity.ok(filiereService.creerFiliere(dto));
    }

    /* ====================
       MODIFICATION
       ==================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @PutMapping("/{id}")
    @Operation(
            summary = "Modifier une filière",
            description = "Met à jour les informations d’une filière existante"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Filière modifiée"),
            @ApiResponse(responseCode = "404", description = "Filière introuvable")
    })
    public ResponseEntity<FiliereDto> modifierFiliere(
            @PathVariable Long id,
            @Valid @RequestBody FiliereDto dto
    ) {
        return ResponseEntity.ok(filiereService.modifierFiliere(id, dto));
    }

    /* ====================
       CONSULTATION
       ==================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping("/{id}")
    @Operation(
            summary = "Récupérer une filière par ID",
            description = "Retourne les informations d’une filière par son identifiant"
    )
    public ResponseEntity<FiliereDto> getFiliereById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(filiereService.getFiliereById(id));
    }
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping("/code/{code}")
    @Operation(
            summary = "Rechercher une filière par code",
            description = "Retourne une filière à partir de son code unique"
    )
    public ResponseEntity<FiliereDto> rechercherParCode(
            @PathVariable String code
    ) {
        return ResponseEntity.ok(filiereService.rechercherParCode(code));
    }
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping
    @Operation(
            summary = "Lister toutes les filières",
            description = "Retourne la liste complète des filières académiques"
    )
    public ResponseEntity<List<FiliereDto>> listerToutesLesFilieres() {
        return ResponseEntity.ok(filiereService.listerToutesLesFilieres());
    }

    /* ====================
       SUPPRESSION
       ==================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Supprimer une filière",
            description = "Supprime définitivement une filière"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Filière supprimée"),
            @ApiResponse(responseCode = "404", description = "Filière introuvable")
    })
    public ResponseEntity<Void> supprimerFiliere(
            @PathVariable Long id
    ) {
        filiereService.supprimerFiliere(id);
        return ResponseEntity.noContent().build();
    }
}
