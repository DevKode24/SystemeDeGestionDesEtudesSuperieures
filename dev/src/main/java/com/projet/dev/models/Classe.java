package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "classes",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"filiere_id", "niveau_id"}
                )
        }
)
@Data
public class Classe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Exemple : L2-INF-2024 */
    @Column(nullable = false, unique = true)
    private String code;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "filiere_id")
    @JsonBackReference // enfant
    private Filiere filiere;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "niveau_id")
    @JsonBackReference // enfant
    private Niveau niveau;


    @JsonManagedReference // parent
    @OneToMany(mappedBy = "classe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enseignement> enseignements = new ArrayList<>();

    @JsonIgnore
    @JsonManagedReference // parent
    @OneToMany(mappedBy = "classe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Etudiant> etudiants = new ArrayList<>();

    @Column(nullable = false)
    private boolean active = true;

    public Classe() {
    }

    public Classe(Long id, String code, Filiere filiere, Niveau niveau, boolean active) {
        this.id = id;
        this.code = code;
        this.filiere = filiere;
        this.niveau = niveau;
        this.active = active;
    }

    public Classe(Long classeId) {
    }

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

    public Filiere getFiliere() {
        return filiere;
    }

    public void setFiliere(Filiere filiere) {
        this.filiere = filiere;
    }

    public Niveau getNiveau() {
        return niveau;
    }

    public void setNiveau(Niveau niveau) {
        this.niveau = niveau;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}

