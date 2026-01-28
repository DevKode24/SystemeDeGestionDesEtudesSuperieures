package com.projet.dev.controlleur;

import com.projet.dev.DTO.NoteDto;
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
@RequestMapping("/api/v1/enseignant/notes")
@Tag(name = "Note", description = "Gestion des notes des étudiants")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE','ENSEIGNANT')")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    /* ==========================
       CRÉATION
       ========================== */
    @PostMapping
    @Operation(summary = "Enregistrer une note", description = "Ajoute une nouvelle note pour un étudiant et une matière")
    public ResponseEntity<NoteDto> enregistrerNote(@Valid @RequestBody NoteDto noteDto) {
        return ResponseEntity.ok(noteService.enregistrerNote(noteDto));
    }

    /* ==========================
       MODIFICATION
       ========================== */
    @PutMapping("/{id}")
    @Operation(summary = "Modifier une note", description = "Met à jour les notes CC et Examen d'une note existante")
    public ResponseEntity<NoteDto> modifierNote(@PathVariable Long id,
                                                @RequestParam Double noteCC,
                                                @RequestParam Double noteExamen) {
        return ResponseEntity.ok(noteService.modifierNote(id, noteCC, noteExamen));
    }

    /* ==========================
       SUPPRESSION
       ========================== */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une note", description = "Supprime une note existante")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Note supprimée"),
            @ApiResponse(responseCode = "404", description = "Note introuvable")
    })
    public ResponseEntity<Void> supprimerNote(@PathVariable Long id) {
        noteService.supprimerNote(id);
        return ResponseEntity.noContent().build();
    }

    /* ==========================
       CONSULTATION
       ========================== */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une note par ID", description = "Retourne les informations d'une note par son identifiant")
    public ResponseEntity<NoteDto> getNoteById(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getNoteById(id));
    }

    @GetMapping("/etudiant/{etudiantId}")
    @Operation(summary = "Lister les notes d'un étudiant", description = "Retourne toutes les notes associées à un étudiant")
    public ResponseEntity<List<NoteDto>> listerNotesParEtudiant(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(noteService.listerNotesParEtudiant(etudiantId));
    }

    /*@GetMapping("/matiere/{matiereId}")
    @Operation(summary = "Lister les notes d'une matière", description = "Retourne toutes les notes associées à une matière")
    public ResponseEntity<List<NoteDto>> listerNotesParMatiere(@PathVariable Long matiereId) {
        return ResponseEntity.ok(noteService.listerNotesParMatiere(matiereId));
    }*/
    @GetMapping("/etudiant/{etudiantId}/annee/{anneeId}")
    @Operation(summary = "Lister les notes d’un étudiant pour une année académique")
    public ResponseEntity<List<NoteDto>> listerParEtudiantEtAnnee(
            @PathVariable Long etudiantId,
            @PathVariable Long anneeId
    ) {
        return ResponseEntity.ok(
                noteService.listerNotesParEtudiantEtAnnee(etudiantId, anneeId)
        );
    }
    /* ==========================
       LOGIQUE MÉTIER
       ========================== */
    @GetMapping("/{id}/finale")
    @Operation(summary = "Calculer la note finale", description = "Calcule la note finale d'une note en fonction du CC et de l'examen")
    public ResponseEntity<Double> calculerNoteFinale(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.calculerNoteFinale(id));
    }
}
