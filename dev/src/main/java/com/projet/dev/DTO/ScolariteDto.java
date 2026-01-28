package com.projet.dev.DTO;

import com.projet.dev.models.Scolarite;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScolariteDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String password;

    public static ScolariteDto fromEntity(Scolarite scolarite) {
        ScolariteDto dto = new ScolariteDto();
        dto.setId(scolarite.getId());
        dto.setNom(scolarite.getNom());
        dto.setPrenom(scolarite.getPrenom());
        dto.setEmail(scolarite.getEmail());
        return dto;
    }
}
