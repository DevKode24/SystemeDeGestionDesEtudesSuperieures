package com.projet.dev.DTO;

import lombok.Data;

@Data
public class ClasseDto {

    private Long id;
    private String code;

    private Long filiereId;
    private String filiereNom;

    private Long niveauId;
    private String niveauLibelle;

    private boolean active;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Long getFiliereId() {
        return filiereId;
    }

    public void setFiliereId(Long filiereId) {
        this.filiereId = filiereId;
    }

    public String getFiliereNom() {
        return filiereNom;
    }

    public void setFiliereNom(String filiereNom) {
        this.filiereNom = filiereNom;
    }

    public Long getNiveauId() {
        return niveauId;
    }

    public void setNiveauId(Long niveauId) {
        this.niveauId = niveauId;
    }

    public String getNiveauLibelle() {
        return niveauLibelle;
    }

    public void setNiveauLibelle(String niveauLibelle) {
        this.niveauLibelle = niveauLibelle;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
