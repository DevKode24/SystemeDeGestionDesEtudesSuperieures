package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "bulletins")
@Builder
@Data
public class Bulletin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "annee_academique_id", nullable = false)
    private AnneeAcademique anneeAcademique;

    @Column(nullable = false)
    private double moyenneAnnuelle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DecisionBulletin decision;

    @Column(nullable = false)
    private LocalDate dateGeneration;

    @Column(nullable = false)
    private boolean verrouille = false;

    public Bulletin() {
    }

    public Bulletin(Long id, Etudiant etudiant, AnneeAcademique anneeAcademique, double moyenneAnnuelle, DecisionBulletin decision, LocalDate dateGeneration, boolean verrouille) {
        this.id = id;
        this.etudiant = etudiant;
        this.anneeAcademique = anneeAcademique;
        this.moyenneAnnuelle = moyenneAnnuelle;
        this.decision = decision;
        this.dateGeneration = dateGeneration;
        this.verrouille = verrouille;
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

    public AnneeAcademique getAnneeAcademique() {
        return anneeAcademique;
    }

    public void setAnneeAcademique(AnneeAcademique anneeAcademique) {
        this.anneeAcademique = anneeAcademique;
    }

    public double getMoyenneAnnuelle() {
        return moyenneAnnuelle;
    }

    public void setMoyenneAnnuelle(double moyenneAnnuelle) {
        this.moyenneAnnuelle = moyenneAnnuelle;
    }

    public DecisionBulletin getDecision() {
        return decision;
    }

    public void setDecision(DecisionBulletin decision) {
        this.decision = decision;
    }

    public LocalDate getDateGeneration() {
        return dateGeneration;
    }

    public void setDateGeneration(LocalDate dateGeneration) {
        this.dateGeneration = dateGeneration;
    }

    public boolean isVerrouille() {
        return verrouille;
    }

    public void setVerrouille(boolean verrouille) {
        this.verrouille = verrouille;
    }
}