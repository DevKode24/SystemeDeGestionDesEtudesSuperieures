package com.projet.dev.controlleur;

import com.projet.dev.DTO.EtudiantNoteDto;
import com.projet.dev.DTO.MatiereDto;
import com.projet.dev.models.Classe;
import com.projet.dev.models.Etudiant;
import com.projet.dev.models.Matiere;
import com.projet.dev.repository.EtudiantRepository;
import com.projet.dev.services.EnseignementService;
import com.projet.dev.services.EtudiantService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@RestController
@RequestMapping("/api/v1/enseignant/pedagogie")
@Tag(name = "Pédagogie Enseignant")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ENSEIGNANT','ADMIN','SCOLARITE')")
public class EnseignantPedagogiqueController {

    private final EnseignementService enseignementService;
    private final EtudiantService etudiantService;

    private final EtudiantRepository etudiantRepository;

    public EnseignantPedagogiqueController(EnseignementService enseignementService, EtudiantService etudiantService, EtudiantRepository etudiantRepository) {
        this.enseignementService = enseignementService;
        this.etudiantService = etudiantService;
        this.etudiantRepository = etudiantRepository;
    }

    /**
     * 📘 Classes de l’enseignant connecté
     */
    @PreAuthorize("hasRole('ENSEIGNANT')")
    @GetMapping("/classes")
    public ResponseEntity<List<Classe>> getMesClasses() {
        return ResponseEntity.ok(
                enseignementService.getMesClasses()
        );
    }

    /**
     * 📗 Matières de l’enseignant connecté dans une classe
     */
    @PreAuthorize("hasRole('ENSEIGNANT')")
    @GetMapping("/classes/{classeId}/matieres")
    public ResponseEntity<List<Matiere>> getMesMatieres(
            @PathVariable Long classeId
    ) {
        return ResponseEntity.ok(
                enseignementService.getMesMatieresParClasse(classeId)
        );
    }

    @PreAuthorize("hasRole('ENSEIGNANT')")
    @GetMapping("/classes/{classeId}/etudiantss")
    public ResponseEntity<List<Etudiant>> getEtudiantsDeMaClasse(
            @PathVariable Long classeId
    ) {
        return ResponseEntity.ok(
                enseignementService.getEtudiantsDeMaClasse(classeId)
        );
    }
    @PreAuthorize("hasRole('ENSEIGNANT')")
    @GetMapping("/classes/{id}/etudiants")
    public List<EtudiantNoteDto> getEtudiants(@PathVariable Long id) {
        return enseignementService.listerEtudiantsParClasse(id);
    }
   /* @GetMapping("/classes/{id}/etudiants")
    public List<EtudiantNoteDto> getEtudiants(@PathVariable Long id) {
        return etudiantRepository.findByClasseId(id)
                .stream()
                .map(e -> new EtudiantNoteDto(
                        e.getId(),
                        e.getNom(),
                        e.getPrenom(),
                        e.getMatricule()
                ))
                .toList();
    }*/

}
