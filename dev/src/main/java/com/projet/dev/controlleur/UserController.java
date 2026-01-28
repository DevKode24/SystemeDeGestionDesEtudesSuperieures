package com.projet.dev.controlleur;

import com.projet.dev.DTO.UserLightDto;
import com.projet.dev.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/utilisateurs")
@Tag(name = "Utilisateur", description = "Gestion complète des comptes utilisateurs")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SCOLARITE')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /* ==========================
       CRÉATION UTILISATEUR
       ========================== */
    @PostMapping
    @Operation(summary = "Créer un utilisateur", description = "Ajoute un nouvel utilisateur dans le système (Etudiant, Enseignant, Admin, Scolarité)")
    public ResponseEntity<?> creerUtilisateur(@Valid @RequestBody UserLightDto dto) {
        try {
            if (userService.existeParEmail(dto.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("L'email '" + dto.getEmail() + "' est déjà utilisé.");
            }
            UserLightDto created = userService.creerUtilisateur(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la création de l'utilisateur: " + e.getMessage());
        }
    }

    /* ==========================
       MODIFICATION UTILISATEUR
       ========================== */
    @PutMapping("/{id}")
    @Operation(summary = "Modifier un utilisateur", description = "Met à jour les informations d'un utilisateur existant")
    public ResponseEntity<?> modifierUtilisateur(@PathVariable Long id,
                                                 @Valid @RequestBody UserLightDto dto) {
        try {
            UserLightDto updated = userService.modifierUtilisateur(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Utilisateur introuvable: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la modification: " + e.getMessage());
        }
    }

    /* ==========================
       CONSULTATION UTILISATEURS
       ========================== */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un utilisateur par ID")
    public ResponseEntity<?> getUtilisateurById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getUtilisateurById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Utilisateur introuvable: " + e.getMessage());
        }
    }

    @GetMapping("/email")
    @Operation(summary = "Récupérer un utilisateur par email")
    public ResponseEntity<?> getUtilisateurByEmail(@RequestParam String email) {
        try {
            return ResponseEntity.ok(userService.getUtilisateurByEmail(email));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Utilisateur introuvable: " + e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Lister tous les utilisateurs")
    public ResponseEntity<List<UserLightDto>> listerTousLesUtilisateurs() {
        return ResponseEntity.ok(userService.listerTousLesUtilisateurs());
    }

    /* ==========================
       GESTION COMPTE
       ========================== */
    @PostMapping("/{id}/activer")
    @Operation(summary = "Activer un compte utilisateur")
    public ResponseEntity<?> activerCompte(@PathVariable Long id) {
        try {
            userService.activerCompte(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Utilisateur introuvable");
        }
    }

    @PostMapping("/{id}/desactiver")
    @Operation(summary = "Désactiver un compte utilisateur")
    public ResponseEntity<?> desactiverCompte(@PathVariable Long id) {
        try {
            userService.desactiverCompte(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Utilisateur introuvable");
        }
    }

    @PostMapping("/{id}/changer-mot-de-passe")
    @Operation(summary = "Changer le mot de passe")
    public ResponseEntity<?> changerMotDePasse(@PathVariable Long id,
                                               @RequestParam String nouveauMotDePasse) {
        try {
            userService.changerMotDePasse(id, nouveauMotDePasse);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Utilisateur introuvable");
        }
    }
}



