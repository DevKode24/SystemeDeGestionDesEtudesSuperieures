package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@DiscriminatorValue("ENSEIGNANT")
@Table(name = "enseignants")
public class Enseignant extends User {

    @Column(nullable = false)
    private String specialite;

    @Column
    private String grade;

    // Relation avec UE : un enseignant peut enseigner plusieurs UE

    @OneToMany(mappedBy = "enseignant", fetch = FetchType.LAZY)
    @JsonManagedReference // parent
    private java.util.List<Matiere> matieres = new ArrayList<>();

    @JsonManagedReference // parent
    @OneToMany(mappedBy = "enseignant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enseignement> enseignements = new ArrayList<>();

    public Enseignant() {
        super();
    }

    // Constructeur métier
    public Enseignant(
            String nom,
            String prenom,
            String email,
            String password,
            String specialite,
            String grade
    ) {
        super(nom, prenom, email, password);
        this.specialite = specialite;
        this.grade = grade;
    }

    public Enseignant(String nom, String prenom, String email, String password) {
    }

    public Enseignant(Long enseignantId) {
    }

     /* =======================
       GETTERS & SETTERS
       ======================= */

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public List<Matiere> getMatieres() {
        return matieres;
    }

    public void setMatieres(List<Matiere> matieres) {
        this.matieres = matieres;
    }
}