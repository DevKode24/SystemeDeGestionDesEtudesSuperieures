package com.projet.dev.controlleur;

import com.projet.dev.DTO.EnseignementDto;
import com.projet.dev.models.Classe;
import com.projet.dev.models.Etudiant;
import com.projet.dev.services.EnseignementService;
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
@RequestMapping("/api/v1/admin/enseignements")
@Tag(name = "Enseignement", description = "Gestion des enseignements (matière + classe + enseignant)")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
public class EnseignementController {

    private final EnseignementService enseignementService;

    public EnseignementController(EnseignementService enseignementService) {
        this.enseignementService = enseignementService;
    }

    @PostMapping
    @Operation(summary = "Créer un enseignement")
    public ResponseEntity<EnseignementDto> creer(
            @Valid @RequestBody EnseignementDto dto
    ) {
        return ResponseEntity.ok(enseignementService.creerEnseignement(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un enseignement")
    public ResponseEntity<EnseignementDto> modifier(
            @PathVariable Long id,
            @Valid @RequestBody EnseignementDto dto
    ) {
        return ResponseEntity.ok(
                enseignementService.modifierEnseignement(id, dto)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter un enseignement")
    public ResponseEntity<EnseignementDto> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(enseignementService.getById(id));
    }

    @GetMapping
    @Operation(summary = "Lister tous les enseignements")
    public ResponseEntity<List<EnseignementDto>> listerTous() {
        return ResponseEntity.ok(enseignementService.listerTous());
    }


    @GetMapping("/enseignant/{enseignantId}")
    @Operation(summary = "Lister les enseignements par enseignant")
    public ResponseEntity<List<EnseignementDto>> listerParEnseignant(
            @PathVariable Long enseignantId
    ) {
        return ResponseEntity.ok(
                enseignementService.listerParEnseignant(enseignantId)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Désactiver un enseignement")
    public ResponseEntity<Void> desactiver(
            @PathVariable Long id
    ) {
        enseignementService.desactiver(id);
        return ResponseEntity.ok().build();
    }


}
