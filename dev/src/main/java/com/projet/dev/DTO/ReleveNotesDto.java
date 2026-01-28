package com.projet.dev.DTO;

import com.projet.dev.models.StatutReleve;
import com.projet.dev.models.TypeReleve;

import java.time.LocalDateTime;

public class ReleveNotesDto {

    private Long id;

    /* ===== Enseignant ===== */
    private Long enseignantId;
    private String enseignantNom;

    /* ===== Classe ===== */
    private Long classeId;
    private String classeLibelle;

    /* ===== Matière ===== */
    private Long matiereId;
    private String matiereLibelle;

    /* ===== Année académique ===== */
    private Long anneeAcademiqueId;
    private String anneeAcademiqueLibelle;

    /* ===== Type & statut ===== */
    private TypeReleve typeReleve;
    private StatutReleve statut;

    /* ===== Métadonnées ===== */
    private LocalDateTime dateCreation;

    /* ================= GETTERS & SETTERS ================= */

    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
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

    public Long getClasseId() {
        return classeId;
    }

    public void setClasseId(Long classeId) {
        this.classeId = classeId;
    }

    public String getClasseLibelle() {
        return classeLibelle;
    }

    public void setClasseLibelle(String classeLibelle) {
        this.classeLibelle = classeLibelle;
    }

    public Long getMatiereId() {
        return matiereId;
    }

    public void setMatiereId(Long matiereId) {
        this.matiereId = matiereId;
    }

    public String getMatiereLibelle() {
        return matiereLibelle;
    }

    public void setMatiereLibelle(String matiereLibelle) {
        this.matiereLibelle = matiereLibelle;
    }

    public Long getAnneeAcademiqueId() {
        return anneeAcademiqueId;
    }

    public void setAnneeAcademiqueId(Long anneeAcademiqueId) {
        this.anneeAcademiqueId = anneeAcademiqueId;
    }

    public String getAnneeAcademiqueLibelle() {
        return anneeAcademiqueLibelle;
    }

    public void setAnneeAcademiqueLibelle(String anneeAcademiqueLibelle) {
        this.anneeAcademiqueLibelle = anneeAcademiqueLibelle;
    }

    public TypeReleve getTypeReleve() {
        return typeReleve;
    }

    public void setTypeReleve(TypeReleve typeReleve) {
        this.typeReleve = typeReleve;
    }

    public StatutReleve getStatut() {
        return statut;
    }

    public void setStatut(StatutReleve statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

}
