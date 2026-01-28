package com.projet.dev.DTO;

import java.util.HashMap;
import java.util.Map;

public class EtudiantNoteDto {
    private Long id;
    private String nom;
    private String prenom;
    private String matricule;

    // clé = idMatiere, valeur = note
    private Map<Long, Double> notes = new HashMap<>();

    public EtudiantNoteDto(Long id, String nom, String prenom) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
    }

    public EtudiantNoteDto(Long id, String nom, String prenom, String matricule, Map<Long, Double> notes) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.matricule = matricule;
        this.notes = notes;
    }
    public EtudiantNoteDto(
            Long id,
            String nom,
            String prenom,
            String matricule
    ) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.matricule = matricule;
        this.notes = new HashMap<>();
    }

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

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public Map<Long, Double> getNotes() {
        return notes;
    }

    public void setNotes(Map<Long, Double> notes) {
        this.notes = notes;
    }
}
