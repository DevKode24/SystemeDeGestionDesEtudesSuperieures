package com.projet.dev.DTO;

import lombok.*;

/**
 * Représente une ligne de note pour un étudiant
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneNoteDto {

    /* =========================
   IDENTITÉ ÉTUDIANT
   ========================= */
    private Long etudiantId;
    private String nom;
    private String prenom;
    private String matricule;

    /* =========================
       NOTES SAISIES
       ========================= */
    private Double noteCC;
    private Double noteDST;
    private Double noteSession;

    /* =========================
       NOTES CALCULÉES
       ========================= */
    private Double valeur;

    public Long getEtudiantId() {
        return etudiantId;
    }

    public void setEtudiantId(Long etudiantId) {
        this.etudiantId = etudiantId;
    }

    public Double getNoteCC() {
        return noteCC;
    }

    public void setNoteCC(Double noteCC) {
        this.noteCC = noteCC;
    }

    public Double getNoteDST() {
        return noteDST;
    }

    public void setNoteDST(Double noteDST) {
        this.noteDST = noteDST;
    }

    public Double getNoteSession() {
        return noteSession;
    }

    public void setNoteSession(Double noteSession) {
        this.noteSession = noteSession;
    }

    public Double getValeur() {
        return valeur;
    }

    public void setValeur(Double valeur) {
        this.valeur = valeur;
    }
}
