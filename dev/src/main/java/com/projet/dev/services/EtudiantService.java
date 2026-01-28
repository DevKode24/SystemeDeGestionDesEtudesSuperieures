package com.projet.dev.services;

import com.projet.dev.DTO.*;

import java.util.List;

public interface EtudiantService {

    /* GESTION ÉTUDIANT */
    EtudiantDto creerEtudiant(EtudiantDto dto);
    EtudiantDto modifierEtudiant(Long id, EtudiantDto dto);
    EtudiantDto rechercherParId(Long id);
    EtudiantDto rechercherParMatricule(String matricule);
    List<EtudiantDto> listerTousLesEtudiants();

    /* PARAMÈTRES ACADÉMIQUES */
    double getTauxCC();
    double getTauxExamen();

    /* CALCULS ACADÉMIQUES */
    double calculerNoteFinaleMatiere(double cc, double examen);
    double calculerMoyenneUE(Long etudiantId, Long ueId);
    double calculerMoyenneSemestre(Long etudiantId, Long semestreId);
    double calculerMoyenneAnnuelle(Long etudiantId, Long anneeAcademiqueId);

    /* DÉCISION ACADÉMIQUE */
    String determinerDecisionFinale(double moyenneAnnuelle);

    /* RELEVÉ DE NOTES */
    ReleveNotesDto obtenirSyntheseAcademique(Long etudiantId, Long anneeAcademiqueId);
}
