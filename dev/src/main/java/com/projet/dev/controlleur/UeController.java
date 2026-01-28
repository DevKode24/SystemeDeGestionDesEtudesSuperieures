package com.projet.dev.controlleur;

import com.projet.dev.DTO.UEsDto;
import com.projet.dev.services.UEService;
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
@RequestMapping("/api/v1/admin/ues")
@Tag(name = "UE", description = "Gestion des Unités d'Enseignement et calculs de moyennes UE")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
public class UeController {

    private final UEService ueService;

    public UeController(UEService ueService) {
        this.ueService = ueService;
    }

    /* ==========================
       CRÉATION UE
       ========================== */
    @PostMapping
    @Operation(summary = "Créer une UE", description = "Ajoute une nouvelle Unité d'Enseignement dans le système")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "UE créée"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<UEsDto> creerUE(@Valid @RequestBody UEsDto dto) {
        return ResponseEntity.ok(ueService.creerUE(dto));
    }

    /* ==========================
       GET ALL UE
       ========================== */
    @GetMapping
    @Operation(summary = "Lister toutes les UE", description = "Retourne toutes les UE existantes")
    public ResponseEntity<List<UEsDto>> getAllUEs() {
        List<UEsDto> ues = ueService.getAllUEs();
        return ResponseEntity.ok(ues);
    }

    /* ==========================
       MODIFICATION UE
       ========================== */
    @PutMapping("/{id}")
    @Operation(summary = "Modifier une UE", description = "Met à jour les informations d'une UE existante")
    public ResponseEntity<UEsDto> modifierUE(@PathVariable Long id,
                                             @Valid @RequestBody UEsDto dto) {
        return ResponseEntity.ok(ueService.modifierUE(id, dto));
    }

    /* ==========================
       SUPPRESSION UE
       ========================== */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une UE", description = "Supprime une UE par son ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "UE supprimée"),
            @ApiResponse(responseCode = "403", description = "Accès interdit")
    })
    public ResponseEntity<Void> supprimerUE(@PathVariable Long id) {
        ueService.supprimerUE(id);  // ← À implémenter dans le service
        return ResponseEntity.noContent().build();
    }

    /* ==========================
       CONSULTATION
       ========================== */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une UE", description = "Retourne les informations d'une UE par son ID")
    public ResponseEntity<UEsDto> getUEById(@PathVariable Long id) {
        return ResponseEntity.ok(ueService.getUEById(id));
    }

    @GetMapping("/semestre/{semestreId}")
    @Operation(summary = "Lister les UE d'un semestre", description = "Retourne toutes les UE associées à un semestre")
    public ResponseEntity<List<UEsDto>> getUEsBySemestre(@PathVariable Long semestreId) {
        return ResponseEntity.ok(ueService.getUEsBySemestre(semestreId));
    }

    /* ==========================
       CALCUL MOYENNE UE
       ========================== */
    @GetMapping("/{ueId}/etudiant/{etudiantId}/moyenne")
    @Operation(summary = "Calculer la moyenne d'une UE", description = "Calcule la moyenne d'un étudiant pour une UE donnée")
    public ResponseEntity<Double> calculerMoyenneUE(@PathVariable Long ueId,
                                                    @PathVariable Long etudiantId) {
        double moyenne = ueService.calculerMoyenneUE(etudiantId, ueId);
        return ResponseEntity.ok(moyenne);
    }
}
