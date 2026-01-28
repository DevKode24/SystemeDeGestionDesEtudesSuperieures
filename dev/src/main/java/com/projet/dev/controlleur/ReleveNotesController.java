package com.projet.dev.controlleur;

import com.projet.dev.DTO.ReleveNotesDto;
import com.projet.dev.services.ReleveNotesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/releves")
public class ReleveNotesController {

    private final ReleveNotesService releveNotesService;

    public ReleveNotesController(ReleveNotesService releveNotesService) {
        this.releveNotesService = releveNotesService;
    }

    @PostMapping
    public ResponseEntity<ReleveNotesDto> creerReleve(@RequestBody ReleveNotesDto dto) {
        ReleveNotesDto releveCree = releveNotesService.creerReleve(dto);
        return ResponseEntity.ok(releveCree);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReleveNotesDto> obtenirReleve(@PathVariable Long id) {
        ReleveNotesDto releve = releveNotesService.obtenirReleveParId(id);
        return ResponseEntity.ok(releve);
    }

    @GetMapping
    public ResponseEntity<List<ReleveNotesDto>> listerReleves() {
        List<ReleveNotesDto> releves = releveNotesService.listerTousLesReleves();
        return ResponseEntity.ok(releves);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReleveNotesDto> mettreAJourReleve(@PathVariable Long id,
                                                            @RequestBody ReleveNotesDto dto) {
        ReleveNotesDto misAJour = releveNotesService.mettreAJourReleve(id, dto);
        return ResponseEntity.ok(misAJour);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerReleve(@PathVariable Long id) {
        releveNotesService.supprimerReleve(id);
        return ResponseEntity.noContent().build();
    }
}

