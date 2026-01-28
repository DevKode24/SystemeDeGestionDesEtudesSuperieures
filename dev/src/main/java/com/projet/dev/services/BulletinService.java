package com.projet.dev.services;

import com.projet.dev.DTO.BulletinDto;
import com.projet.dev.DTO.NoteDto;

import java.util.List;
public interface BulletinService {

    BulletinDto genererBulletinAnnuel(Long etudiantId, Long anneeAcademiqueId);

    double calculerMoyenneAnnuelle(Long etudiantId, Long anneeAcademiqueId);

  List<NoteDto> recupererNotes(Long etudiantId, Long anneeAcademiqueId);
    String determinerDecisionFinale(double moyenne);

    void verrouillerBulletin(Long bulletinId);

    boolean bulletinEstVerrouille(Long bulletinId);

    List<BulletinDto> getBulletinsByEtudiant(Long etudiantId);
}
