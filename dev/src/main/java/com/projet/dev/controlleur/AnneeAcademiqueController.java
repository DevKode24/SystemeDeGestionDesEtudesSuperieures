package com.projet.dev.controlleur;

import com.projet.dev.DTO.AnneeAcademiqueDto;
import com.projet.dev.services.AnneeAcademiqueService;
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
@RequestMapping("/api/v1/admin/Anneeacademique")
@Tag(name = "Année Académique", description = "Gestion des années académiques et calculs annuels")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
public class AnneeAcademiqueController {

    private final AnneeAcademiqueService anneeAcademiqueService;

    public AnneeAcademiqueController(AnneeAcademiqueService anneeAcademiqueService) {
        this.anneeAcademiqueService = anneeAcademiqueService;
    }

    /* ==========================
       CRÉATION
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @PostMapping
    @Operation(summary = "Créer une année académique")
    public ResponseEntity<AnneeAcademiqueDto> creerAnneeAcademique(
            @Valid @RequestBody AnneeAcademiqueDto dto
    ) {
        return ResponseEntity.ok(anneeAcademiqueService.creerAnneeAcademique(dto));
    }

    /* ==========================
       CONSULTATION
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une année académique par ID")
    public ResponseEntity<AnneeAcademiqueDto> getAnneeAcademiqueById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(anneeAcademiqueService.getAnneeAcademiqueById(id));
    }
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping
    @Operation(summary = "Lister toutes les années académiques")
    public ResponseEntity<List<AnneeAcademiqueDto>> listerToutesLesAnnees() {
        return ResponseEntity.ok(anneeAcademiqueService.listerToutesLesAnneesAcademiques());
    }

    /* ==========================
       MODIFICATION
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @PutMapping("/{id}")
    @Operation(summary = "Modifier une année académique")
    public ResponseEntity<AnneeAcademiqueDto> modifierAnneeAcademique(
            @PathVariable Long id,
            @Valid @RequestBody AnneeAcademiqueDto dto
    ) {
        return ResponseEntity.ok(
                anneeAcademiqueService.modifierAnneeAcademique(id, dto)
        );
    }

    /* ==========================
       SUPPRESSION
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une année académique")
    public ResponseEntity<Void> supprimerAnneeAcademique(
            @PathVariable Long id
    ) {
        anneeAcademiqueService.supprimerAnneeAcademique(id);
        return ResponseEntity.noContent().build();
    }

    /* ==========================
       MOYENNE ANNUELLE
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping("/{anneeId}/etudiant/{etudiantId}/moyenne")
    @Operation(summary = "Calculer la moyenne annuelle")
    public ResponseEntity<Double> calculerMoyenneAnnuelle(
            @PathVariable Long anneeId,
            @PathVariable Long etudiantId
    ) {
        return ResponseEntity.ok(
                anneeAcademiqueService.calculerMoyenneAnnuelle(etudiantId, anneeId)
        );
    }

    /* ==========================
       DÉCISION FINALE
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping("/decision")
    @Operation(summary = "Déterminer la décision finale")
    public ResponseEntity<String> determinerDecisionFinale(
            @RequestParam double moyenne
    ) {
        return ResponseEntity.ok(
                anneeAcademiqueService.determinerDecisionFinale(moyenne)
        );
    }
}
