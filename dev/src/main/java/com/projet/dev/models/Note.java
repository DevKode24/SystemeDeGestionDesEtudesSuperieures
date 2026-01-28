package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "notes",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {
                        "etudiant_id",
                        "matiere_id",
                        "annee_academique_id"
                }
        )
)
@Getter
@Setter
@NoArgsConstructor
public class Note {

    /* =========================
       🆔 IDENTITÉ
       ========================= */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* =========================
       📘 SESSION ACADÉMIQUE
       ========================= */

    @Enumerated(EnumType.STRING)
    @Column(name = "session", length = 20)
    private Session session;



    /* =========================
       🎯 NOTES SAISIES
       ========================= */

    /** Contrôle Continu */
    private Double noteCC;

    /** Devoir surveillé (DST) */
    private Double noteDST;

    /** Examen normal */
    private Double noteExamen;

    /** Examen de rattrapage */
    private Double noteRattrapage;

    /* =========================
       🧮 NOTES CALCULÉES
       ========================= */

    /** Note du devoir = CC + DST */
    private Double noteDevoir;

    /** Note de session = max(examen, rattrapage) */
    private Double noteSession;

    /** Note finale officielle */
    private Double noteFinale;

    /* =========================
       ⚖️ PONDÉRATIONS (en %)
       ========================= */

    @Column(nullable = false)
    private Double poidsCC = 40.0;

    @Column(nullable = false)
    private Double poidsDST = 60.0;

    @Column(nullable = false)
    private Double poidsDevoir = 35.0;

    @Column(nullable = false)
    private Double poidsSession = 65.0;

    /* =========================
       📚 CONTEXTE ACADÉMIQUE
       ========================= */

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "annee_academique_id", nullable = false)
    @JsonBackReference // enfant
    private AnneeAcademique anneeAcademique;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "etudiant_id", nullable = false)
    @JsonBackReference // enfant
    private Etudiant etudiant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matiere_id", nullable = false)
    @JsonBackReference // enfant
    private Matiere matiere;

    /* =========================
       🔄 MÉTHODES MÉTIER
       ========================= */

    /**
     * Calcule la note du devoir (CC + DST)
     */
    public void calculerNoteDevoir() {
        double cc = noteCC != null ? noteCC : 0;
        double dst = noteDST != null ? noteDST : 0;

        this.noteDevoir =
                (cc * poidsCC / 100.0) +
                        (dst * poidsDST / 100.0);
    }

    /**
     * Calcule la meilleure note de session
     */
    public void calculerNoteSession() {
        double examen = noteExamen != null ? noteExamen : 0;
        double rattrapage = noteRattrapage != null ? noteRattrapage : 0;

        this.noteSession = Math.max(examen, rattrapage);
    }

    /**
     * Calcule la note finale officielle
     */
    public void calculerNoteFinale() {
        double devoir = noteDevoir != null ? noteDevoir : 0;
        double sessionValidee = noteSession != null ? noteSession : 0;

        this.noteFinale =
                (devoir * poidsDevoir / 100.0) +
                        (sessionValidee * poidsSession / 100.0);
    }

    /**
     * 🔁 Recalcul global sécurisé
     */
    public void recalculerToutesLesNotes() {
        calculerNoteDevoir();
        calculerNoteSession();
        calculerNoteFinale();
    }

    /* =========================
       🧠 MÉTHODES UTILITAIRES
       ========================= */

    /**
     * Retourne la valeur pertinente selon le type de relevé
     */
    public Double getValeur(TypeReleve typeReleve) {
        return switch (typeReleve) {
            case CC -> noteCC;
            case DST -> noteDST;
            case SESSION_NORMALE, SESSION_RATTRAPAGE -> noteSession;
        };
    }

    /**
     * Redéfinit dynamiquement les pondérations
     */
    public void definirPoids(
            Double poidsCC,
            Double poidsDST,
            Double poidsDevoir,
            Double poidsSession
    ) {
        if (poidsCC + poidsDST != 100 || poidsDevoir + poidsSession != 100) {
            throw new IllegalArgumentException("Les pondérations doivent totaliser 100%");
        }
        this.poidsCC = poidsCC;
        this.poidsDST = poidsDST;
        this.poidsDevoir = poidsDevoir;
        this.poidsSession = poidsSession;
    }

    public void definirPoids(Double pourcentageCC, Double pourcentageExamen) {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Double getNoteCC() {
        return noteCC;
    }

    public void setNoteCC(Double noteCC) {
        this.noteCC = noteCC;
    }

    public Double getNoteDST() {
        return noteDST;
    }

    public void setNoteDST(Double noteDST) {
        this.noteDST = noteDST;
    }

    public Double getNoteExamen() {
        return noteExamen;
    }

    public void setNoteExamen(Double noteExamen) {
        this.noteExamen = noteExamen;
    }

    public Double getNoteRattrapage() {
        return noteRattrapage;
    }

    public void setNoteRattrapage(Double noteRattrapage) {
        this.noteRattrapage = noteRattrapage;
    }

    public Double getNoteDevoir() {
        return noteDevoir;
    }

    public void setNoteDevoir(Double noteDevoir) {
        this.noteDevoir = noteDevoir;
    }

    public Double getNoteSession() {
        return noteSession;
    }

    public void setNoteSession(Double noteSession) {
        this.noteSession = noteSession;
    }

    public Double getNoteFinale() {
        return noteFinale;
    }

    public void setNoteFinale(Double noteFinale) {
        this.noteFinale = noteFinale;
    }

    public Double getPoidsCC() {
        return poidsCC;
    }

    public void setPoidsCC(Double poidsCC) {
        this.poidsCC = poidsCC;
    }

    public Double getPoidsDST() {
        return poidsDST;
    }

    public void setPoidsDST(Double poidsDST) {
        this.poidsDST = poidsDST;
    }

    public Double getPoidsDevoir() {
        return poidsDevoir;
    }

    public void setPoidsDevoir(Double poidsDevoir) {
        this.poidsDevoir = poidsDevoir;
    }

    public Double getPoidsSession() {
        return poidsSession;
    }

    public void setPoidsSession(Double poidsSession) {
        this.poidsSession = poidsSession;
    }

    public AnneeAcademique getAnneeAcademique() {
        return anneeAcademique;
    }

    public void setAnneeAcademique(AnneeAcademique anneeAcademique) {
        this.anneeAcademique = anneeAcademique;
    }

    public Etudiant getEtudiant() {
        return etudiant;
    }

    public void setEtudiant(Etudiant etudiant) {
        this.etudiant = etudiant;
    }

    public Matiere getMatiere() {
        return matiere;
    }

    public void setMatiere(Matiere matiere) {
        this.matiere = matiere;
    }

    public void setValeur(double devoir) {
    }
}
