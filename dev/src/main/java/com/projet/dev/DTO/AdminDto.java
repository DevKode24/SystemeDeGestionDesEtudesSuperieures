package com.projet.dev.DTO;

import com.projet.dev.models.Admin;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String password;

    public static AdminDto fromEntity(Admin admin) {
        AdminDto dto = new AdminDto();
        dto.setId(admin.getId());
        dto.setNom(admin.getNom());
        dto.setPrenom(admin.getPrenom());
        dto.setEmail(admin.getEmail());
        return dto;
    }
}
