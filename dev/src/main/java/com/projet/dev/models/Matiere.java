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
@Table(name = "matieres")
@Getter
@Setter

public class Matiere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code;

    private String intitule;

    private Double coefficient;

    /** Plusieurs matières → un enseignant */
    @ManyToOne
    @JoinColumn(name = "enseignant_id")
    @JsonBackReference // enfant
    private Enseignant enseignant;

    /** Une matière → une UE */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ue_id", nullable = false)
    private UE ue;

    /** Une matière → plusieurs notes */
    @JsonManagedReference // parent
    @OneToMany(mappedBy = "matiere", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Note> notes = new ArrayList<>();

    @JsonManagedReference // parent
    @OneToMany(mappedBy = "matiere", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enseignement> enseignements = new ArrayList<>();

    public Matiere(Long matiereId) {
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

    public String getIntitule() {
        return intitule;
    }

    public void setIntitule(String intitule) {
        this.intitule = intitule;
    }

    public Double getCoefficient() {
        return coefficient;
    }

    public void setCoefficient(Double coefficient) {
        this.coefficient = coefficient;
    }

    public Enseignant getEnseignant() {
        return enseignant;
    }

    public void setEnseignant(Enseignant enseignant) {
        this.enseignant = enseignant;
    }

    public UE getUe() {
        return ue;
    }

    public void setUe(UE ue) {
        this.ue = ue;
    }

    public List<Note> getNotes() {
        return notes;
    }

    public void setNotes(List<Note> notes) {
        this.notes = notes;
    }

    public Matiere() {
    }

    public Matiere(Long id, String code, String intitule, Double coefficient, Enseignant enseignant, UE ue, List<Note> notes) {
        this.id = id;
        this.code = code;
        this.intitule = intitule;
        this.coefficient = coefficient;
        this.enseignant = enseignant;
        this.ue = ue;
        this.notes = notes;
    }
}
