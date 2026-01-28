package com.projet.dev.models;


import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "releve_notes",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {
                        "enseignant_id",
                        "classe_id",
                        "matiere_id",
                        "annee_academique_id",
                        "type_note"
                }
        )
)
public class ReleveNotes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_note", nullable = false)
    private TypeReleve typeNote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enseignant_id")
    private Enseignant enseignant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "classe_id")
    private Classe classe;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matiere_id")
    private Matiere matiere;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "annee_academique_id")
    private AnneeAcademique anneeAcademique;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutReleve statut = StatutReleve.EN_ATTENTE;

    @OneToMany(
            mappedBy = "releve",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<LigneNote> lignes = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime dateCreation;

    /* =========================
       MÉTHODES UTILITAIRES
       ========================= */

    public void ajouterLigne(LigneNote ligne) {
        lignes.add(ligne);
        ligne.setReleve(this);
    }

    public void viderLignes() {
        lignes.clear();
    }

    /* =========================
       GETTERS / SETTERS
       ========================= */

    public Long getId() {
        return id;
    }

    public TypeReleve getTypeNote() {
        return typeNote;
    }

    public void setTypeNote(TypeReleve typeNote) {
        this.typeNote = typeNote;
    }

    public Enseignant getEnseignant() {
        return enseignant;
    }

    public void setEnseignant(Enseignant enseignant) {
        this.enseignant = enseignant;
    }

    public Classe getClasse() {
        return classe;
    }

    public void setClasse(Classe classe) {
        this.classe = classe;
    }

    public Matiere getMatiere() {
        return matiere;
    }

    public void setMatiere(Matiere matiere) {
        this.matiere = matiere;
    }

    public AnneeAcademique getAnneeAcademique() {
        return anneeAcademique;
    }

    public void setAnneeAcademique(AnneeAcademique anneeAcademique) {
        this.anneeAcademique = anneeAcademique;
    }

    public StatutReleve getStatut() {
        return statut;
    }

    public void setStatut(StatutReleve statut) {
        this.statut = statut;
    }

    public List<LigneNote> getLignes() {
        return lignes;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public ReleveNotes() {
    }

    public ReleveNotes(Long id, TypeReleve typeNote, Enseignant enseignant, Classe classe, Matiere matiere, AnneeAcademique anneeAcademique, StatutReleve statut, List<LigneNote> lignes, LocalDateTime dateCreation) {
        this.id = id;
        this.typeNote = typeNote;
        this.enseignant = enseignant;
        this.classe = classe;
        this.matiere = matiere;
        this.anneeAcademique = anneeAcademique;
        this.statut = statut;
        this.lignes = lignes;
        this.dateCreation = dateCreation;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLignes(List<LigneNote> lignes) {
        this.lignes = lignes;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
