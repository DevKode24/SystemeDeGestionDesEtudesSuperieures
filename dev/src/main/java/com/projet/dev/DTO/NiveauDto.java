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
public class NiveauDto {
    private Long id;
    private String libelle;
    private Long filiereId;
    @JsonIgnore
    private List<EtudiantDto> etudiants;
    private String code;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public Long getFiliereId() {
        return filiereId;
    }

    public void setFiliereId(Long filiereId) {
        this.filiereId = filiereId;
    }

    public List<EtudiantDto> getEtudiants() {
        return etudiants;
    }

    public void setEtudiants(List<EtudiantDto> etudiants) {
        this.etudiants = etudiants;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
