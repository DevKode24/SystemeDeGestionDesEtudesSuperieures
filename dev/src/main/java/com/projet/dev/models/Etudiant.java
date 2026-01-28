package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;


@Entity
@Table(name = "etudiants")
@DiscriminatorValue("ETUDIANT")
@Getter @Setter
public class Etudiant extends User {

    @Column(nullable = false, unique = true)
    private String matricule;

    private LocalDate dateNaissance;
    private String lieuNaissance;

    private String sexe;
    private String nationalite;
    private String etatCivil;

    private String contactEtudiant;
    private String contactUrgence;
    private String nomTuteur;

    private LocalDate dateInscription;

    /* =======================
       RELATIONS
       ======================= */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filiere_id", nullable = false)
    private Filiere filiere;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "niveau_id", nullable = false)
    private Niveau niveau;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "classe_id", nullable = false)
    private Classe classe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annees_academiques_id", nullable = false)
    private AnneeAcademique anneeAcademique;

    /* =======================
       NOTES & BULLETINS
       ======================= */
    @JsonManagedReference // parent
    @OneToMany(mappedBy = "etudiant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Note> notes = new ArrayList<>();

    @OneToMany(mappedBy = "etudiant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bulletin> bulletins = new ArrayList<>();

    public Etudiant(String matricule, LocalDate dateNaissance, String lieuNaissance, String sexe, String nationalite, String etatCivil, String contactEtudiant, String contactUrgence, String nomTuteur, LocalDate dateInscription, Filiere filiere, Niveau niveau, Classe classe, AnneeAcademique anneeAcademique, List<Note> notes, List<Bulletin> bulletins) {
        this.matricule = matricule;
        this.dateNaissance = dateNaissance;
        this.lieuNaissance = lieuNaissance;
        this.sexe = sexe;
        this.nationalite = nationalite;
        this.etatCivil = etatCivil;
        this.contactEtudiant = contactEtudiant;
        this.contactUrgence = contactUrgence;
        this.nomTuteur = nomTuteur;
        this.dateInscription = dateInscription;
        this.filiere = filiere;
        this.niveau = niveau;
        this.classe = classe;
        this.anneeAcademique = anneeAcademique;
        this.notes = notes;
        this.bulletins = bulletins;
    }

    public Etudiant(Long id, String nom, String prenom, String email, boolean actif, String password, boolean enabled, Set<Role> roles, String matricule, LocalDate dateNaissance, String lieuNaissance, String sexe, String nationalite, String etatCivil, String contactEtudiant, String contactUrgence, String nomTuteur, LocalDate dateInscription, Filiere filiere, Niveau niveau, Classe classe, AnneeAcademique anneeAcademique, List<Note> notes, List<Bulletin> bulletins) {
        super(id, nom, prenom, email, actif, password, enabled, roles);
        this.matricule = matricule;
        this.dateNaissance = dateNaissance;
        this.lieuNaissance = lieuNaissance;
        this.sexe = sexe;
        this.nationalite = nationalite;
        this.etatCivil = etatCivil;
        this.contactEtudiant = contactEtudiant;
        this.contactUrgence = contactUrgence;
        this.nomTuteur = nomTuteur;
        this.dateInscription = dateInscription;
        this.filiere = filiere;
        this.niveau = niveau;
        this.classe = classe;
        this.anneeAcademique = anneeAcademique;
        this.notes = notes;
        this.bulletins = bulletins;
    }

    public Etudiant(String nom, String prenom, String email, String password, String matricule, LocalDate dateNaissance, String lieuNaissance, String sexe, String nationalite, String etatCivil, String contactEtudiant, String contactUrgence, String nomTuteur, LocalDate dateInscription, Filiere filiere, Niveau niveau, Classe classe, AnneeAcademique anneeAcademique, List<Note> notes, List<Bulletin> bulletins) {
        super(nom, prenom, email, password);
        this.matricule = matricule;
        this.dateNaissance = dateNaissance;
        this.lieuNaissance = lieuNaissance;
        this.sexe = sexe;
        this.nationalite = nationalite;
        this.etatCivil = etatCivil;
        this.contactEtudiant = contactEtudiant;
        this.contactUrgence = contactUrgence;
        this.nomTuteur = nomTuteur;
        this.dateInscription = dateInscription;
        this.filiere = filiere;
        this.niveau = niveau;
        this.classe = classe;
        this.anneeAcademique = anneeAcademique;
        this.notes = notes;
        this.bulletins = bulletins;
    }

    public Etudiant(Long id, String nom, String prenom, String email, String password, String matricule, LocalDate dateNaissance, String lieuNaissance, String sexe, String nationalite, String etatCivil, String contactEtudiant, String contactUrgence, String nomTuteur, LocalDate dateInscription, Filiere filiere, Niveau niveau, Classe classe, AnneeAcademique anneeAcademique, List<Note> notes, List<Bulletin> bulletins) {
        super(id, nom, prenom, email, password);
        this.matricule = matricule;
        this.dateNaissance = dateNaissance;
        this.lieuNaissance = lieuNaissance;
        this.sexe = sexe;
        this.nationalite = nationalite;
        this.etatCivil = etatCivil;
        this.contactEtudiant = contactEtudiant;
        this.contactUrgence = contactUrgence;
        this.nomTuteur = nomTuteur;
        this.dateInscription = dateInscription;
        this.filiere = filiere;
        this.niveau = niveau;
        this.classe = classe;
        this.anneeAcademique = anneeAcademique;
        this.notes = notes;
        this.bulletins = bulletins;
    }

    public Etudiant() {

    }

    public Etudiant(String nom, String prenom, String email, String encodedPassword) {
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(LocalDate dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public String getLieuNaissance() {
        return lieuNaissance;
    }

    public void setLieuNaissance(String lieuNaissance) {
        this.lieuNaissance = lieuNaissance;
    }

    public String getSexe() {
        return sexe;
    }

    public void setSexe(String sexe) {
        this.sexe = sexe;
    }

    public String getNationalite() {
        return nationalite;
    }

    public void setNationalite(String nationalite) {
        this.nationalite = nationalite;
    }

    public String getEtatCivil() {
        return etatCivil;
    }

    public void setEtatCivil(String etatCivil) {
        this.etatCivil = etatCivil;
    }

    public String getContactEtudiant() {
        return contactEtudiant;
    }

    public void setContactEtudiant(String contactEtudiant) {
        this.contactEtudiant = contactEtudiant;
    }

    public String getContactUrgence() {
        return contactUrgence;
    }

    public void setContactUrgence(String contactUrgence) {
        this.contactUrgence = contactUrgence;
    }

    public String getNomTuteur() {
        return nomTuteur;
    }

    public void setNomTuteur(String nomTuteur) {
        this.nomTuteur = nomTuteur;
    }

    public LocalDate getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(LocalDate dateInscription) {
        this.dateInscription = dateInscription;
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

    public Classe getClasse() {
        return classe;
    }

    public void setClasse(Classe classe) {
        this.classe = classe;
    }

    public AnneeAcademique getAnneeAcademique() {
        return anneeAcademique;
    }

    public void setAnneeAcademique(AnneeAcademique anneeAcademique) {
        this.anneeAcademique = anneeAcademique;
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
}