package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "niveaux")
@Getter
@Setter
public class Niveau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String libelle; // L1, L2, L3, M1, M2

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filiere_id")
    private Filiere filiere;
    @Column(nullable = true)
    private String code;


    @OneToMany(mappedBy = "niveau", fetch = FetchType.LAZY)
    private List<Etudiant> etudiants = new ArrayList<>();


    @JsonManagedReference // parent
    @OneToMany(mappedBy = "niveau", fetch = FetchType.LAZY)
    private List<Classe> classes = new ArrayList<>();

    public Niveau() {
    }

    public Niveau(Long id, String libelle, Filiere filiere, String code, List<Etudiant> etudiants) {
        this.id = id;
        this.libelle = libelle;
        this.filiere = filiere;
        this.code = code;
        this.etudiants = etudiants;
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

    public Filiere getFiliere() {
        return filiere;
    }

    public void setFiliere(Filiere filiere) {
        this.filiere = filiere;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public List<Etudiant> getEtudiants() {
        return etudiants;
    }

    public void setEtudiants(List<Etudiant> etudiants) {
        this.etudiants = etudiants;
    }
}
