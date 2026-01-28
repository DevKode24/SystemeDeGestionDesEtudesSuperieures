package com.projet.dev.controlleur;

import com.projet.dev.DTO.AnneeAcademiqueDto;
import com.projet.dev.services.AnneeAcademiqueService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/annee-academique")
@PreAuthorize("hasAnyRole('ADMIN','ENSEIGNANT','SCOLARITE')")
public class AnneeAcademiquePublicController {

    private final AnneeAcademiqueService service;

    public AnneeAcademiquePublicController(AnneeAcademiqueService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Lister toutes les années académiques")
    public ResponseEntity<List<AnneeAcademiqueDto>> listerToutesLesAnnees() {
        return ResponseEntity.ok(service.listerToutesLesAnneesAcademiques());
    }
}
