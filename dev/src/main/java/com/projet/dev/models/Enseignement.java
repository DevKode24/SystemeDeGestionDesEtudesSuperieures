package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity

@Getter
@Setter
@Table(
        name = "enseignements",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"matiere_id", "classe_id"}
                )
        }
)
@Data
public class Enseignement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Matière enseignée */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matiere_id")
    @JsonBackReference // enfant
    private Matiere matiere;

    /** Classe concernée */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "classe_id")
    @JsonBackReference // enfant
    private Classe classe;

    /** Enseignant responsable */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enseignant_id")
    @JsonBackReference // enfant
    private Enseignant enseignant;

    /** Activation pédagogique */
    @Column(nullable = false)
    private boolean actif = true;


    public Enseignement() {
    }

    public Enseignement(Long id, Matiere matiere, Classe classe, Enseignant enseignant, boolean actif) {
        this.id = id;
        this.matiere = matiere;
        this.classe = classe;
        this.enseignant = enseignant;
        this.actif = actif;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Matiere getMatiere() {
        return matiere;
    }

    public void setMatiere(Matiere matiere) {
        this.matiere = matiere;
    }

    public Classe getClasse() {
        return classe;
    }

    public void setClasse(Classe classe) {
        this.classe = classe;
    }

    public Enseignant getEnseignant() {
        return enseignant;
    }

    public void setEnseignant(Enseignant enseignant) {
        this.enseignant = enseignant;
    }

    public boolean isActif() {
        return actif;
    }

    public void setActif(boolean actif) {
        this.actif = actif;
    }
}
