package com.projet.dev.controlleur;

import com.projet.dev.DTO.EnseignantDto;
import com.projet.dev.DTO.SaisieNotesDto;
import com.projet.dev.models.Classe;
import com.projet.dev.models.Enseignement;
import com.projet.dev.models.Matiere;
import com.projet.dev.models.Note;
import com.projet.dev.services.EnseignantService;
import com.projet.dev.services.EnseignementService;
import com.projet.dev.services.NoteService;
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
@RequestMapping("/api/v1/admin/enseignants")
@Tag(name = "Enseignant", description = "Gestion des enseignants et affectations pédagogiques")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
public class EnseignantController {

    private final EnseignantService enseignantService;
    private final EnseignementService enseignementService;
    private final NoteService noteService;

    public EnseignantController(EnseignantService enseignantService, EnseignementService enseignementService,
                                NoteService noteService) {
        this.enseignantService = enseignantService;
        this.enseignementService = enseignementService;
        this.noteService = noteService;
    }

    /* ==========================
       CRÉATION ENSEIGNANT
       ========================== */

    @PostMapping
    @Operation(
            summary = "Créer un enseignant",
            description = "Ajoute un nouvel enseignant dans le système"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Enseignant créé"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<EnseignantDto> creerEnseignant(
            @Valid @RequestBody EnseignantDto dto
    ) {
        return ResponseEntity.ok(enseignantService.creerEnseignant(dto));
    }

    /* ==========================
       MODIFICATION
       ========================== */

    @PutMapping("/{id}")
    @Operation(
            summary = "Modifier un enseignant",
            description = "Met à jour les informations d’un enseignant existant"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Enseignant modifié"),
            @ApiResponse(responseCode = "404", description = "Enseignant introuvable")
    })
    public ResponseEntity<EnseignantDto> modifierEnseignant(
            @PathVariable Long id,
            @Valid @RequestBody EnseignantDto dto
    ) {
        return ResponseEntity.ok(
                enseignantService.modifierEnseignant(id, dto)
        );
    }

    /* ==========================
       CONSULTATION
       ========================== */

    @GetMapping("/{id}")
    @Operation(
            summary = "Consulter un enseignant",
            description = "Retourne les informations d’un enseignant par son ID"
    )
    public ResponseEntity<EnseignantDto> getEnseignantById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                enseignantService.getEnseignantById(id)
        );
    }

    @GetMapping
    @Operation(
            summary = "Lister tous les enseignants",
            description = "Retourne la liste complète des enseignants"
    )
    public ResponseEntity<List<EnseignantDto>> listerTousLesEnseignants() {
        return ResponseEntity.ok(
                enseignantService.listerTousLesEnseignants()
        );
    }

    @GetMapping("/specialite")
    @Operation(
            summary = "Rechercher par spécialité",
            description = "Retourne les enseignants correspondant à une spécialité donnée"
    )
    public ResponseEntity<List<EnseignantDto>> rechercherParSpecialite(
            @RequestParam String specialite
    ) {
        return ResponseEntity.ok(
                enseignantService.rechercherParSpecialite(specialite)
        );
    }

    /* ==========================
       AFFECTATION Matiere
       ========================== */

    @PutMapping("/{enseignantId}/Matier/{MatiereId}")
    @Operation(
            summary = "Affecter un enseignant à une Matiere",
            description = "Associe un enseignant à une Matiere"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Affectation réussie"),
            @ApiResponse(responseCode = "404", description = "Enseignant ou Matiere introuvable")
    })
    public ResponseEntity<Void> affecterEnseignantAMatiere(
            @PathVariable Long enseignantId,
            @PathVariable Long MatiereId) {
        enseignantService.affecterEnseignantAMatiere(enseignantId, MatiereId);
        return ResponseEntity.ok().build();
    }


    /* ==========================
    CLASSES AFFECTÉES
    ========================== */
    @GetMapping("/{enseignantId}/classes")
    @Operation(summary = "Lister les classes affectées à l'enseignant")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des classes"),
            @ApiResponse(responseCode = "404", description = "Enseignant introuvable")
    })
    public ResponseEntity<List<Classe>> getClassesAffectees(
            @PathVariable Long enseignantId
    ) {
        return ResponseEntity.ok(enseignantService.getClassesAffectees(enseignantId));
    }

    /* ==========================
       MATIÈRES PAR CLASSE
       ========================== */
    @GetMapping("/{enseignantId}/classes/{classeId}/matieres")
    @Operation(summary = "Lister les matières d'une classe pour l'enseignant")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste des matières"),
            @ApiResponse(responseCode = "404", description = "Enseignant ou classe introuvable")
    })
    public ResponseEntity<List<Matiere>> getMatieresParClasse(
            @PathVariable Long enseignantId,
            @PathVariable Long classeId
    ) {
        return ResponseEntity.ok(
                enseignantService.getMatieresParClasse(enseignantId, classeId)
        );
    }
}