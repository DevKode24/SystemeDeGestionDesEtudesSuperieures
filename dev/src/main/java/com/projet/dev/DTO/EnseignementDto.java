package com.projet.dev.DTO;

import lombok.Data;

@Data
public class EnseignementDto {

    private Long id;

    private Long matiereId;
    private String matiereIntitule;

    private Long classeId;
    private String classeCode;

    private Long enseignantId;
    private String enseignantNom;

    private boolean actif;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMatiereId() {
        return matiereId;
    }

    public void setMatiereId(Long matiereId) {
        this.matiereId = matiereId;
    }

    public String getMatiereIntitule() {
        return matiereIntitule;
    }

    public void setMatiereIntitule(String matiereIntitule) {
        this.matiereIntitule = matiereIntitule;
    }

    public Long getClasseId() {
        return classeId;
    }

    public void setClasseId(Long classeId) {
        this.classeId = classeId;
    }

    public String getClasseCode() {
        return classeCode;
    }

    public void setClasseCode(String classeCode) {
        this.classeCode = classeCode;
    }

    public Long getEnseignantId() {
        return enseignantId;
    }

    public void setEnseignantId(Long enseignantId) {
        this.enseignantId = enseignantId;
    }

    public String getEnseignantNom() {
        return enseignantNom;
    }

    public void setEnseignantNom(String enseignantNom) {
        this.enseignantNom = enseignantNom;
    }

    public boolean isActif() {
        return actif;
    }

    public void setActif(boolean actif) {
        this.actif = actif;
    }
}
