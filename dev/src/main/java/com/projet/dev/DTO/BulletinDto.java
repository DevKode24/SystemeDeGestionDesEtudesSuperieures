package com.projet.dev.DTO;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class BulletinDto {

    private Long id;
    private Double moyenneAnnuelle;
    private String decision;
    private EtudiantDto etudiant;
    private AnneeAcademiqueDto anneeAcademique;

    /** Notes affichées sur le bulletin (non persistées ici) */
    private List<NoteDto> notes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getMoyenneAnnuelle() {
        return moyenneAnnuelle;
    }

    public void setMoyenneAnnuelle(Double moyenneAnnuelle) {
        this.moyenneAnnuelle = moyenneAnnuelle;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public EtudiantDto getEtudiant() {
        return etudiant;
    }

    public void setEtudiant(EtudiantDto etudiant) {
        this.etudiant = etudiant;
    }

    public AnneeAcademiqueDto getAnneeAcademique() {
        return anneeAcademique;
    }

    public void setAnneeAcademique(AnneeAcademiqueDto anneeAcademique) {
        this.anneeAcademique = anneeAcademique;
    }

    public List<NoteDto> getNotes() {
        return notes;
    }

    public void setNotes(List<NoteDto> notes) {
        this.notes = notes;
    }
}
