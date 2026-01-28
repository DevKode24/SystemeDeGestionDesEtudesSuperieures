package com.projet.dev.controlleur;

import com.projet.dev.DTO.AnneeAcademiqueDto;
import com.projet.dev.DTO.SaisieNotesDto;
import com.projet.dev.services.SaisieNotesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enseignant/ReleveNotes")
@PreAuthorize("hasRole('ENSEIGNANT')")
@Tag(name = "Relevé de notes", description = "Gestion des relevés de notes par l'enseignant")
@CrossOrigin("*")
public class SaisieNotesController {

    private final SaisieNotesService saisieNotesService;

    public SaisieNotesController(SaisieNotesService saisieNotesService) {
        this.saisieNotesService = saisieNotesService;
    }

    @PostMapping("/releve")
    @Operation(summary = "Enregistrer ou modifier un relevé de notes")
    public ResponseEntity<Void> enregistrerReleve(@Valid @RequestBody SaisieNotesDto dto) {
        saisieNotesService.enregistrerSaisieNotes(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/charger")
    public SaisieNotesDto chargerSaisieNotes(
            @RequestParam Long classeId,
            @RequestParam Long matiereId,
            @RequestParam Long anneeAcademiqueId
    ) {
        return saisieNotesService.chargerSaisieNotes(
                classeId,
                matiereId,
                anneeAcademiqueId
        );
    }

}
