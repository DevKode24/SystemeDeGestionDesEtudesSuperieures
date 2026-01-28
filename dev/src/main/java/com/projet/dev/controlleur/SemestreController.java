package com.projet.dev.controlleur;

import com.projet.dev.DTO.SemestreDto;
import com.projet.dev.services.SemestreService;
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
@RequestMapping("/api/v1/admin/semestres")
@Tag(name = "Semestre", description = "Gestion des semestres et calcul des moyennes semestrielles")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")

/* 🔐 Accès global : ADMIN ou SCOLARITE */
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
public class SemestreController {

    private final SemestreService semestreService;

    public SemestreController(SemestreService semestreService) {
        this.semestreService = semestreService;
    }

    /* ==========================
       CRÉATION SEMESTRE
       ========================== */
    @PreAuthorize("hasAuthority('admin:create')")
    @PostMapping
    @Operation(summary = "Créer un semestre", description = "Ajoute un nouveau semestre dans le système")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Semestre créé"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<SemestreDto> creerSemestre(@Valid @RequestBody SemestreDto dto) {
        return ResponseEntity.ok(semestreService.creerSemestre(dto));
    }
    /* ==========================
   LISTER TOUS LES SEMESTRES
   ========================== */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    @Operation(
            summary = "Lister tous les semestres",
            description = "Retourne tous les semestres existants dans le système"
    )
    public ResponseEntity<List<SemestreDto>> getAllSemestres() {
        List<SemestreDto> semestres = semestreService.getAllSemestres(); // <-- à créer dans le service
        return ResponseEntity.ok(semestres);
    }

    /* ==========================
       MODIFICATION SEMESTRE
       ========================== */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Modifier un semestre", description = "Met à jour les informations d'un semestre existant")
    public ResponseEntity<SemestreDto> modifierSemestre(
            @PathVariable Long id,
            @Valid @RequestBody SemestreDto dto
    ) {
        return ResponseEntity.ok(semestreService.modifierSemestre(id, dto));
    }

    /* ==========================
       CONSULTATION
       ========================== */

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un semestre", description = "Retourne les informations d'un semestre par son ID")
    public ResponseEntity<SemestreDto> getSemestreById(@PathVariable Long id) {
        return ResponseEntity.ok(semestreService.getSemestreById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/annee/{anneeId}")
    @Operation(
            summary = "Lister les semestres d'une année académique",
            description = "Retourne tous les semestres associés à une année académique"
    )
    public ResponseEntity<List<SemestreDto>> getSemestresByAnneeAcademique(
            @PathVariable Long anneeId
    ) {
        return ResponseEntity.ok(
                semestreService.getSemestresByAnneeAcademique(anneeId)
        );
    }

    /* ==========================
       CALCUL MOYENNE SEMESTRE
       ========================== */

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{semestreId}/etudiant/{etudiantId}/moyenne")
    @Operation(
            summary = "Calculer la moyenne semestrielle",
            description = "Calcule la moyenne d'un étudiant pour un semestre donné"
    )
    public ResponseEntity<Double> calculerMoyenneSemestre(
            @PathVariable Long semestreId,
            @PathVariable Long etudiantId
    ) {
        double moyenne = semestreService.calculerMoyenneSemestre(etudiantId, semestreId);
        return ResponseEntity.ok(moyenne);
    }
}
