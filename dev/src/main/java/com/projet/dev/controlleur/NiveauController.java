package com.projet.dev.controlleur;

import com.projet.dev.DTO.NiveauDto;
import com.projet.dev.services.NiveauService;
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
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
@RestController
@RequestMapping("/api/v1/admin/niveaux")
@Tag(name = "Niveau", description = "Gestion des niveaux académiques")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
public class NiveauController {

    private final NiveauService niveauService;

    public NiveauController(NiveauService niveauService) {
        this.niveauService = niveauService;
    }

    /* ==========================
       CRÉATION
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @PostMapping
    @Operation(summary = "Créer un niveau", description = "Ajoute un nouveau niveau académique")
    public ResponseEntity<NiveauDto> creerNiveau(@Valid @RequestBody NiveauDto dto) {
        return ResponseEntity.ok(niveauService.creerNiveau(dto));
    }

    /* ==========================
       MODIFICATION
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @PutMapping("/{id}")
    @Operation(summary = "Modifier un niveau", description = "Met à jour un niveau existant")
    public ResponseEntity<NiveauDto> modifierNiveau(@PathVariable Long id,
                                                    @Valid @RequestBody NiveauDto dto) {
        return ResponseEntity.ok(niveauService.modifierNiveau(id, dto));
    }

    /* ==========================
       CONSULTATION
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un niveau par ID", description = "Retourne les informations d’un niveau par son identifiant")
    public ResponseEntity<NiveauDto> getNiveauById(@PathVariable Long id) {
        return ResponseEntity.ok(niveauService.getNiveauById(id));
    }
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping
    @Operation(summary = "Lister tous les niveaux", description = "Retourne la liste complète des niveaux")
    public ResponseEntity<List<NiveauDto>> listerTousLesNiveaux() {
        return ResponseEntity.ok(niveauService.listerTousLesNiveaux());
    }

    /* ==========================
       LOGIQUE MÉTIER
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @GetMapping("/filiere/{filiereId}")
    @Operation(summary = "Lister les niveaux d’une filière", description = "Retourne tous les niveaux rattachés à une filière")
    public ResponseEntity<List<NiveauDto>> listerNiveauxParFiliere(@PathVariable Long filiereId) {
        return ResponseEntity.ok(niveauService.listerNiveauxParFiliere(filiereId));
    }
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @PutMapping("/{niveauId}/filiere/{filiereId}")
    @Operation(summary = "Rattacher un niveau à une filière", description = "Associe un niveau à une filière donnée")
    public ResponseEntity<Void> rattacherNiveauAFiliere(@PathVariable Long niveauId,
                                                        @PathVariable Long filiereId) {
        niveauService.rattacherNiveauAFiliere(niveauId, filiereId);
        return ResponseEntity.noContent().build();
    }

    /* ==========================
       SUPPRESSION
       ========================== */
    @PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un niveau", description = "Supprime définitivement un niveau")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Niveau supprimé"),
            @ApiResponse(responseCode = "404", description = "Niveau introuvable")
    })
    public ResponseEntity<Void> supprimerNiveau(@PathVariable Long id) {
        niveauService.supprimerNiveau(id);
        return ResponseEntity.noContent().build();
    }
}
