package com.projet.dev.DTO;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class FiliereDto {
    private Long id;
    private String nom;
    private String code; // ajout du champ code
    @JsonIgnore
    private List<EtudiantDto> etudiants;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public List<EtudiantDto> getEtudiants() {
        return etudiants;
    }

    public void setEtudiants(List<EtudiantDto> etudiants) {
        this.etudiants = etudiants;
    }
}
