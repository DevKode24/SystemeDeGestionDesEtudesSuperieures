package com.projet.dev.controlleur;

import com.projet.dev.DTO.BulletinDto;
import com.projet.dev.services.BulletinService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bulletins")
@Tag(name = "Bulletin", description = "Gestion des bulletins académiques")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")

public class BulletinController {

    private final BulletinService bulletinService;

    public BulletinController(BulletinService bulletinService) {
        this.bulletinService = bulletinService;
    }

    /* ==========================
       GÉNÉRATION BULLETIN
       ========================== */

    @PostMapping("/generer")
    @Operation(
            summary = "Générer un bulletin annuel",
            description = "Génère automatiquement le bulletin annuel d’un étudiant pour une année académique"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bulletin généré avec succès"),
            @ApiResponse(responseCode = "404", description = "Étudiant ou année académique introuvable")
    })
    public ResponseEntity<BulletinDto> genererBulletinAnnuel(
            @RequestParam Long etudiantId,
            @RequestParam Long anneeAcademiqueId
    ) {
        return ResponseEntity.ok(
                bulletinService.genererBulletinAnnuel(etudiantId, anneeAcademiqueId)
        );
    }

    /* ==========================
       CONSULTATION
       ========================== */

    @GetMapping("/etudiant/{etudiantId}")
    @Operation(
            summary = "Bulletins d’un étudiant",
            description = "Retourne la liste des bulletins associés à un étudiant"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bulletins trouvés"),
            @ApiResponse(responseCode = "404", description = "Étudiant introuvable")
    })
    public ResponseEntity<List<BulletinDto>> getBulletinsByEtudiant(
            @PathVariable Long etudiantId
    ) {
        return ResponseEntity.ok(
                bulletinService.getBulletinsByEtudiant(etudiantId)
        );
    }

    /* ==========================
       VERROUILLAGE BULLETIN
       ========================== */

    @PutMapping("/{bulletinId}/verrouiller")
    @Operation(
            summary = "Verrouiller un bulletin",
            description = "Empêche toute modification ultérieure du bulletin"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bulletin verrouillé"),
            @ApiResponse(responseCode = "404", description = "Bulletin introuvable")
    })
    public ResponseEntity<Void> verrouillerBulletin(
            @PathVariable Long bulletinId
    ) {
        bulletinService.verrouillerBulletin(bulletinId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{bulletinId}/verrouille")
    @Operation(
            summary = "Vérifier si un bulletin est verrouillé",
            description = "Retourne true si le bulletin est verrouillé"
    )
    public ResponseEntity<Boolean> bulletinEstVerrouille(
            @PathVariable Long bulletinId
    ) {
        return ResponseEntity.ok(
                bulletinService.bulletinEstVerrouille(bulletinId)
        );
    }
}
