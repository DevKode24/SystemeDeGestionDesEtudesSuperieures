package com.projet.dev.controlleur;

import com.projet.dev.DTO.EtudiantDto;
import com.projet.dev.services.EtudiantService;
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
@RequestMapping("/api/v1/admin/etudiants")
@Tag(name = "Étudiant", description = "Gestion des étudiants et de leurs relevés")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
public class EtudiantController {

    private final EtudiantService etudiantService;

    public EtudiantController(EtudiantService etudiantService) {
        this.etudiantService = etudiantService;
    }

    /* ==========================
       CRÉATION ÉTUDIANT
       ========================== */
    @PostMapping
    @Operation(
            summary = "Créer un étudiant",
            description = "Ajoute un nouvel étudiant dans le système"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Étudiant créé"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<EtudiantDto> creerEtudiant(
            @Valid @RequestBody EtudiantDto dto
    ) {
        return ResponseEntity.ok(etudiantService.creerEtudiant(dto));
    }

    /* ==========================
       MODIFICATION
       ========================== */
    @PutMapping("/{id}")
    @Operation(
            summary = "Modifier un étudiant",
            description = "Met à jour les informations d’un étudiant existant"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Étudiant modifié"),
            @ApiResponse(responseCode = "404", description = "Étudiant introuvable")
    })
    public ResponseEntity<EtudiantDto> modifierEtudiant(
            @PathVariable Long id,
            @Valid @RequestBody EtudiantDto dto
    ) {
        return ResponseEntity.ok(etudiantService.modifierEtudiant(id, dto));
    }

    /* ==========================
       CONSULTATION
       ========================== */
    @GetMapping("/{id}")
    @Operation(
            summary = "Consulter un étudiant",
            description = "Retourne les informations d’un étudiant par son ID"
    )
    public ResponseEntity<EtudiantDto> getEtudiantById(@PathVariable Long id) {
        return ResponseEntity.ok(etudiantService.rechercherParId(id));
    }

    @GetMapping
    @Operation(
            summary = "Lister tous les étudiants",
            description = "Retourne la liste complète des étudiants"
    )
    public ResponseEntity<List<EtudiantDto>> listerTousLesEtudiants() {
        return ResponseEntity.ok(etudiantService.listerTousLesEtudiants());
    }


}
