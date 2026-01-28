package com.projet.dev.mapper;

import com.projet.dev.DTO.ReleveNotesDto;
import com.projet.dev.models.ReleveNotes;
import org.springframework.stereotype.Component;

@Component
public class ReleveNotesMapper {

    public ReleveNotesDto toDto(ReleveNotes entity) {

        ReleveNotesDto dto = new ReleveNotesDto();

        dto.setId(entity.getId());

        /* ================= ENSEIGNANT ================= */
        dto.setEnseignantId(entity.getEnseignant().getId());

        // Pas de getNomComplet → on compose proprement
        dto.setEnseignantNom(
                entity.getEnseignant().getNom() + " " +
                        entity.getEnseignant().getPrenom()
        );

        /* ================= CLASSE ================= */
        dto.setClasseId(entity.getClasse().getId());

        // Pas de getLibelle → on utilise le code (réel et stable)
        dto.setClasseLibelle(entity.getClasse().getCode());

        /* ================= MATIÈRE ================= */
        dto.setMatiereId(entity.getMatiere().getId());
        dto.setMatiereLibelle(entity.getMatiere().getIntitule());

        /* ================= ANNÉE ACADÉMIQUE ================= */
        dto.setAnneeAcademiqueId(entity.getAnneeAcademique().getId());
        dto.setAnneeAcademiqueLibelle(entity.getAnneeAcademique().getLibelle());

        /* ================= TYPE & STATUT ================= */
        // Le champ s'appelle encore typeNote dans l'entité
        dto.setTypeReleve(entity.getTypeNote());

        dto.setStatut(entity.getStatut());

        /* ================= MÉTA ================= */
        dto.setDateCreation(entity.getDateCreation());

        return dto;
    }
}
