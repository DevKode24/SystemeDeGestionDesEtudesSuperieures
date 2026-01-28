package com.projet.dev.services;

import com.projet.dev.DTO.SemestreDto;
import java.util.List;

/**
 * SERVICE MÉTIER SEMESTRE
 * ----------------------
 * Responsable de :
 * - la structure du semestre
 * - l’agrégation des UE
 * - le calcul de la moyenne semestrielle
 */
public interface SemestreService {

    /* ==========================
       GESTION SEMESTRE
       ========================== */

    SemestreDto creerSemestre(SemestreDto semestreDto);
    List<SemestreDto> getAllSemestres();

    SemestreDto modifierSemestre(Long semestreId, SemestreDto semestreDto);

    SemestreDto getSemestreById(Long semestreId);

    List<SemestreDto> getSemestresByAnneeAcademique(Long anneeAcademiqueId);

    /* ==========================
       CALCUL ACADÉMIQUE
       ========================== */

    /**
     * Moyenne Semestre =
     * Σ(moyenne UE × coefficient UE) / Σ(coefficient UE)
     */
    double calculerMoyenneSemestre(Long etudiantId, Long semestreId);
}
