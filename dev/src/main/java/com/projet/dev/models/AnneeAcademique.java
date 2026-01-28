package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "annees_academiques")
@Getter
@Setter
public class AnneeAcademique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Exemple : 2024-2025
     */
    @Column(nullable = false, unique = true)
    private String libelle;

    /**
     * Une année académique → plusieurs semestres
     */

    @OneToMany(
            mappedBy = "anneeAcademique",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @JsonManagedReference // parent
    private List<Semestre> semestres = new ArrayList<>();

    @OneToMany(
            mappedBy = "anneeAcademique",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @JsonManagedReference // parent
    private List<Note> notes = new ArrayList<>();

    @OneToMany(
            mappedBy = "anneeAcademique",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @JsonBackReference
    private List<Note> note = new ArrayList<>();


    @JsonManagedReference
    @OneToMany(
            mappedBy = "anneeAcademique",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Etudiant> etudiants = new ArrayList<>();
    /**
     * Une année académique → plusieurs bulletins
     */
    @OneToMany(mappedBy = "anneeAcademique", fetch = FetchType.LAZY)
    @JsonManagedReference // parent
    private List<Bulletin> bulletins = new ArrayList<>();

    public AnneeAcademique() {
    }

    public AnneeAcademique(Long id, String libelle, List<Semestre> semestres, List<Note> notes, List<Etudiant> etudiants, List<Bulletin> bulletins) {
        this.id = id;
        this.libelle = libelle;
        this.semestres = semestres;
        this.notes = notes;
        this.etudiants = etudiants;
        this.bulletins = bulletins;
    }

    public AnneeAcademique(Long anneeAcademiqueId) {
    }

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

    public List<Semestre> getSemestres() {
        return semestres;
    }

    public void setSemestres(List<Semestre> semestres) {
        this.semestres = semestres;
    }

    public List<Note> getNotes() {
        return notes;
    }

    public void setNotes(List<Note> notes) {
        this.notes = notes;
    }

    public List<Bulletin> getBulletins() {
        return bulletins;
    }

    public void setBulletins(List<Bulletin> bulletins) {
        this.bulletins = bulletins;
    }


    public List<Etudiant> getEtudiants() {
        return etudiants;
    }

    public void setEtudiants(List<Etudiant> etudiants) {
        this.etudiants = etudiants;
    }
}
