package com.projet.dev.controlleur;

import com.projet.dev.DTO.AdminDto;
import com.projet.dev.services.AdminService;
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
@RequestMapping("/api/v1/admin/admins")
@Tag(name = "Admin", description = "Gestion des administrateurs du système")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /* ==========================
       CRÉATION ADMIN
       ========================== */
    @PostMapping
    @Operation(summary = "Ajouter un administrateur", description = "Crée un nouvel administrateur dans le système")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Administrateur créé"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<AdminDto> creerAdmin(@Valid @RequestBody AdminDto dto) {
        return ResponseEntity.ok(adminService.creerAdmin(dto));
    }

    /* ==========================
       MODIFICATION ADMIN
       ========================== */
    @PutMapping("/{id}")
    @Operation(summary = "Modifier un administrateur", description = "Met à jour les informations d’un administrateur existant")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Administrateur modifié"),
            @ApiResponse(responseCode = "404", description = "Administrateur introuvable")
    })
    public ResponseEntity<AdminDto> modifierAdmin(@PathVariable Long id, @Valid @RequestBody AdminDto dto) {
        return ResponseEntity.ok(adminService.modifierAdmin(id, dto));
    }

    /* ==========================
       CONSULTATION ADMIN
       ========================== */
    @GetMapping("/{id}")
    @Operation(summary = "Consulter un administrateur", description = "Retourne les informations d’un administrateur par son ID")
    public ResponseEntity<AdminDto> getAdminById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAdminById(id));
    }

    @GetMapping("/email")
    @Operation(summary = "Consulter un administrateur par email", description = "Retourne les informations d’un administrateur par son email")
    public ResponseEntity<AdminDto> getAdminByEmail(@RequestParam String email) {
        return ResponseEntity.ok(adminService.getAdminByEmail(email));
    }

    @GetMapping
    @Operation(summary = "Lister tous les administrateurs", description = "Retourne la liste complète des administrateurs")
    public ResponseEntity<List<AdminDto>> listerTousAdmins() {
        return ResponseEntity.ok(adminService.listerTousAdmins());
    }
}
