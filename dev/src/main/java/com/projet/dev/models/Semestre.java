package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "semestres",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"numero", "annee_academique_id"}
        )
)

public class Semestre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 1 ou 2
     */
    @Column(nullable = false)
    private Integer numero;

    /**
     * Plusieurs semestres → une année académique
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annee_academique_id", nullable = false)
    @JsonBackReference // enfant
    private AnneeAcademique anneeAcademique;

    /**
     * Un semestre → plusieurs UE
     */
    @OneToMany(mappedBy = "semestre", cascade = CascadeType.ALL)
    private List<UE> ues = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public AnneeAcademique getAnneeAcademique() {
        return anneeAcademique;
    }

    public void setAnneeAcademique(AnneeAcademique anneeAcademique) {
        this.anneeAcademique = anneeAcademique;
    }

    public List<UE> getUes() {
        return ues;
    }

    public void setUes(List<UE> ues) {
        this.ues = ues;
    }

    public Semestre(Long id, Integer numero, AnneeAcademique anneeAcademique, List<UE> ues) {
        this.id = id;
        this.numero = numero;
        this.anneeAcademique = anneeAcademique;
        this.ues = ues;
    }

    public Semestre() {
    }
}
