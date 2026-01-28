package com.projet.dev.controlleur;

import com.projet.dev.DTO.MatiereDto;
import com.projet.dev.services.MatiereService;
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
@RequestMapping("/api/v1/admin/matieres")
@Tag(name = "Matière", description = "Gestion des matières académiques")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN') or hasRole('SCOLARITE')")
public class MatiereController {

    private final MatiereService matiereService;

    public MatiereController(MatiereService matiereService) {
        this.matiereService = matiereService;
    }

    // Création
    @PostMapping
    @Operation(summary = "Créer une matière", description = "Ajoute une nouvelle matière académique")
    public ResponseEntity<MatiereDto> creerMatiere(@Valid @RequestBody MatiereDto dto) {
        return ResponseEntity.ok(matiereService.creerMatiere(dto));
    }

    // Modification
    @PutMapping("/{id}")
    @Operation(summary = "Modifier une matière", description = "Met à jour les informations d’une matière")
    public ResponseEntity<MatiereDto> modifierMatiere(@PathVariable Long id,
                                                      @Valid @RequestBody MatiereDto dto) {
        return ResponseEntity.ok(matiereService.modifierMatiere(id, dto));
    }

    // Consultation
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une matière par ID", description = "Retourne une matière par son ID")
    public ResponseEntity<MatiereDto> getMatiereById(@PathVariable Long id) {
        return ResponseEntity.ok(matiereService.getMatiereById(id));
    }

    @GetMapping
    @Operation(summary = "Lister toutes les matières", description = "Retourne la liste complète des matières")
    public ResponseEntity<List<MatiereDto>> listerToutesLesMatieres() {
        return ResponseEntity.ok(matiereService.listerToutesLesMatieres());
    }

    // Logique métier
    @GetMapping("/ue/{ueId}")
    @Operation(summary = "Lister les matières d’une UE", description = "Retourne toutes les matières rattachées à une UE")
    public ResponseEntity<List<MatiereDto>> listerMatieresParUE(@PathVariable Long ueId) {
        return ResponseEntity.ok(matiereService.listerMatieresParUE(ueId));
    }

    @PutMapping("/{matiereId}/ue/{ueId}")
    @Operation(summary = "Rattacher une matière à une UE", description = "Associe une matière à une unité d’enseignement")
    public ResponseEntity<Void> rattacherMatiereAUE(@PathVariable Long matiereId, @PathVariable Long ueId) {
        matiereService.rattacherMatiereAUE(matiereId, ueId);
        return ResponseEntity.noContent().build();
    }

    // Suppression
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une matière", description = "Supprime définitivement une matière")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Matière supprimée"),
            @ApiResponse(responseCode = "404", description = "Matière introuvable")
    })
    public ResponseEntity<Void> supprimerMatiere(@PathVariable Long id) {
        matiereService.supprimerMatiere(id);
        return ResponseEntity.noContent().build();
    }
}
