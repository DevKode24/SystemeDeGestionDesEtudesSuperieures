package com.projet.dev.DTO;

import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EtudiantDto extends UserLightDto {

    /* IDENTITÉ ACADÉMIQUE */
    private String matricule;
    private LocalDate dateNaissance;
    private LocalDate dateInscription;
    private AnneeAcademiqueDto anneeAcademique;

    /* INFORMATIONS PERSONNELLES */
    private String sexe;
    private String nationalite;
    private String etatCivil;
    private String lieuNaissance;

    /* CONTACTS */
    private String contactEtudiant;
    private String contactUrgence;
    private String nomTuteur;

    /* STRUCTURE ACADÉMIQUE */
    private FiliereDto filiere;
    private NiveauDto niveau;
    private ClasseDto classe; // ✅ IMPORTANT pour affichage frontend

    /* SÉCURITÉ */
    private String password;
    private Set<String> roles;

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

    public LocalDate getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(LocalDate dateInscription) {
        this.dateInscription = dateInscription;
    }

    public AnneeAcademiqueDto getAnneeAcademique() {
        return anneeAcademique;
    }

    public void setAnneeAcademique(AnneeAcademiqueDto anneeAcademique) {
        this.anneeAcademique = anneeAcademique;
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

    public String getLieuNaissance() {
        return lieuNaissance;
    }

    public void setLieuNaissance(String lieuNaissance) {
        this.lieuNaissance = lieuNaissance;
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

    public FiliereDto getFiliere() {
        return filiere;
    }

    public void setFiliere(FiliereDto filiere) {
        this.filiere = filiere;
    }

    public NiveauDto getNiveau() {
        return niveau;
    }

    public void setNiveau(NiveauDto niveau) {
        this.niveau = niveau;
    }

    public ClasseDto getClasse() {
        return classe;
    }

    public void setClasse(ClasseDto classe) {
        this.classe = classe;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

}
