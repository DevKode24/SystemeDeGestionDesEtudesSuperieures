package com.projet.dev.DTO;

import com.projet.dev.models.Session;
import lombok.*;

/**
 * DTO représentant une note complète
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteDto {

    private Long id;

    /** Note brute ou calculée si CC / Examen non renseignés */
    private Double valeur;

    /** Session d’examen : NORMAL ou RATTRAPAGE */
    private Session session;

    /** Références */
    private Long etudiantId;
    private Long matiereId;
    private Long anneeAcademiqueId;

    /** Pour affichage côté frontend */
    private String anneeAcademique;

    /** Notes saisies */
    private Double noteCC;
    private Double noteExamen;

    /** Note finale cal
    private Double noteFinale;

    /** Pondérations configurables */
    @Builder.Default
    private Double pourcentageCC = 40.0;
    @Builder.Default
    private Double pourcentageExamen = 60.0;
  private double noteFinale;

  /**
     * Calcul automatique de la note finale selon CC/Examen
     */
    public void calculerNoteFinale() {
        if (noteCC != null && noteExamen != null) {
            this.noteFinale = (noteCC * pourcentageCC / 100.0) +
                    (noteExamen * pourcentageExamen / 100.0);
        } else if (valeur != null) {
            this.noteFinale = valeur;
        } else {
            this.noteFinale = Double.parseDouble(null);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getValeur() {
        return valeur;
    }

    public void setValeur(Double valeur) {
        this.valeur = valeur;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Long getEtudiantId() {
        return etudiantId;
    }

    public void setEtudiantId(Long etudiantId) {
        this.etudiantId = etudiantId;
    }

    public Long getMatiereId() {
        return matiereId;
    }

    public void setMatiereId(Long matiereId) {
        this.matiereId = matiereId;
    }

    public Long getAnneeAcademiqueId() {
        return anneeAcademiqueId;
    }

    public void setAnneeAcademiqueId(Long anneeAcademiqueId) {
        this.anneeAcademiqueId = anneeAcademiqueId;
    }

    public String getAnneeAcademique() {
        return anneeAcademique;
    }

    public void setAnneeAcademique(String anneeAcademique) {
        this.anneeAcademique = anneeAcademique;
    }

    public Double getNoteCC() {
        return noteCC;
    }

    public void setNoteCC(Double noteCC) {
        this.noteCC = noteCC;
    }

    public Double getNoteExamen() {
        return noteExamen;
    }

    public void setNoteExamen(Double noteExamen) {
        this.noteExamen = noteExamen;
    }

    public Double getNoteFinale() {
        return noteFinale;
    }

    public void setNoteFinale(Double noteFinale) {
        this.noteFinale = noteFinale;
    }

    public Double getPourcentageCC() {
        return pourcentageCC;
    }

    public void setPourcentageCC(Double pourcentageCC) {
        this.pourcentageCC = pourcentageCC;
    }

    public Double getPourcentageExamen() {
        return pourcentageExamen;
    }

    public void setPourcentageExamen(Double pourcentageExamen) {
        this.pourcentageExamen = pourcentageExamen;
    }
}
