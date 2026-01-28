package com.projet.dev.DTO;

import lombok.*;
import java.util.List;

@Data
@Getter
@Setter
public class AnneeAcademiqueDto {
    private Long id;
    private String libelle;


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



    public AnneeAcademiqueDto() {
    }

    public AnneeAcademiqueDto(Long id, String libelle) {
        this.id = id;
        this.libelle = libelle;
    }


}
