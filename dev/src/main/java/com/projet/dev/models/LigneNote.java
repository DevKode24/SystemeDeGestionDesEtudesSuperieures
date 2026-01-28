package com.projet.dev.models;

import jakarta.persistence.*;

@Entity
@Table(name = "ligne_note")
public class LigneNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Etudiant etudiant;

    @ManyToOne(optional = false)
    private ReleveNotes releve;

    private Double noteCC;
    private Double noteDST;
    private Double noteSession;

    private Double valeurFinale;

    public LigneNote() {
    }

    public LigneNote(Long id, Etudiant etudiant, ReleveNotes releve, Double noteCC, Double noteDST, Double noteSession, Double valeurFinale) {
        this.id = id;
        this.etudiant = etudiant;
        this.releve = releve;
        this.noteCC = noteCC;
        this.noteDST = noteDST;
        this.noteSession = noteSession;
        this.valeurFinale = valeurFinale;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Etudiant getEtudiant() {
        return etudiant;
    }

    public void setEtudiant(Etudiant etudiant) {
        this.etudiant = etudiant;
    }

    public ReleveNotes getReleve() {
        return releve;
    }

    public void setReleve(ReleveNotes releve) {
        this.releve = releve;
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

    public Double getValeurFinale() {
        return valeurFinale;
    }

    public void setValeurFinale(Double valeurFinale) {
        this.valeurFinale = valeurFinale;
    }
}

