package com.projet.dev.controlleur;

import com.projet.dev.DTO.ClasseDto;
import com.projet.dev.services.ClasseService;
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
@RequestMapping("/api/v1/admin/classes")
@Tag(name = "Classe", description = "Gestion des classes (promotions académiques)")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
public class ClasseController {

    private final ClasseService classeService;

    public ClasseController(ClasseService classeService) {
        this.classeService = classeService;
    }

    /* ==========================
       CRÉATION CLASSE
       ========================== */
    @PostMapping
    @Operation(
            summary = "Créer une classe",
            description = "Crée une nouvelle classe (promotion) pour une filière, un niveau et une année académique"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Classe créée avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<ClasseDto> creerClasse(
            @Valid @RequestBody ClasseDto dto
    ) {
        return ResponseEntity.ok(classeService.creerClasse(dto));
    }

    /* ==========================
       MODIFICATION CLASSE
       ========================== */
    @PutMapping("/{id}")
    @Operation(
            summary = "Modifier une classe",
            description = "Met à jour les informations d’une classe existante"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Classe modifiée"),
            @ApiResponse(responseCode = "404", description = "Classe introuvable")
    })
    public ResponseEntity<ClasseDto> modifierClasse(
            @PathVariable Long id,
            @Valid @RequestBody ClasseDto dto
    ) {
        return ResponseEntity.ok(classeService.modifierClasse(id, dto));
    }

    /* ==========================
       CONSULTATION
       ========================== */
    @GetMapping("/{id}")
    @Operation(
            summary = "Consulter une classe",
            description = "Retourne les informations d’une classe à partir de son identifiant"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Classe trouvée"),
            @ApiResponse(responseCode = "404", description = "Classe introuvable")
    })
    public ResponseEntity<ClasseDto> getClasseById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(classeService.getClasseById(id));
    }

    @GetMapping
    @Operation(
            summary = "Lister toutes les classes",
            description = "Retourne la liste complète des classes"
    )
    public ResponseEntity<List<ClasseDto>> listerToutesLesClasses() {
        return ResponseEntity.ok(classeService.listerClasses());
    }

    /* ==========================
       FILTRAGE
       ========================== */

    /* ==========================
       DÉSACTIVATION
       ========================== */
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Désactiver une classe",
            description = "Désactive une classe sans la supprimer (historisation)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Classe désactivée"),
            @ApiResponse(responseCode = "404", description = "Classe introuvable")
    })
    public ResponseEntity<Void> desactiverClasse(
            @PathVariable Long id
    ) {
        classeService.desactiverClasse(id);
        return ResponseEntity.ok().build();
    }
}
