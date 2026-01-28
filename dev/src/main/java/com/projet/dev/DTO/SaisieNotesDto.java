package com.projet.dev.DTO;

import com.projet.dev.models.Session;
import com.projet.dev.models.TypeReleve;
import lombok.*;

import java.util.List;

/**
 * DTO pour la saisie des notes par l'enseignant
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaisieNotesDto {

    /** Identifiant de l’enseignant (côté backend) */
    private Long enseignantId;

    /** Classe sélectionnée (utile côté UI) */
    private Long classeId;

    /** Matière et année académique (obligatoire backend) */
    private Long matiereId;
    private Long anneeAcademiqueId;

    /** Session d’examen : NORMAL ou RATTRAPAGE */
    private Session session;

    /** Liste des lignes de notes par étudiant */
    private List<LigneNoteDto> lignes;
    private TypeReleve typeReleve;


    public Long getEnseignantId() {
        return enseignantId;
    }

    public void setEnseignantId(Long enseignantId) {
        this.enseignantId = enseignantId;
    }

    public Long getClasseId() {
        return classeId;
    }

    public void setClasseId(Long classeId) {
        this.classeId = classeId;
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

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public List<LigneNoteDto> getLignes() {
        return lignes;
    }

    public void setLignes(List<LigneNoteDto> lignes) {
        this.lignes = lignes;
    }
}
