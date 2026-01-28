package com.projet.dev.services;

import com.projet.dev.DTO.AnneeAcademiqueDto;

import java.util.List;

/**
 * SERVICE MÉTIER ANNÉE ACADÉMIQUE
 * ------------------------------
 * Responsable de :
 * - la consolidation annuelle
 * - le calcul de la moyenne générale
 * - la décision académique finale
 */
public interface AnneeAcademiqueService {

    /* ==========================
       GESTION ANNÉE
       ========================== */

    AnneeAcademiqueDto creerAnneeAcademique(AnneeAcademiqueDto dto);

    AnneeAcademiqueDto getAnneeAcademiqueById(Long anneeAcademiqueId);

    List<AnneeAcademiqueDto> listerToutesLesAnneesAcademiques();

    AnneeAcademiqueDto modifierAnneeAcademique(Long id, AnneeAcademiqueDto dto);

    void supprimerAnneeAcademique(Long id);

    /* ==========================
       CALCUL ANNUEL
       ========================== */

    /**
     * Moyenne Annuelle =
     * moyenne arithmétique des semestres
     */
    double calculerMoyenneAnnuelle(Long etudiantId, Long anneeAcademiqueId);

    /**
     * Décision finale annuelle
     */
    String determinerDecisionFinale(double moyenneAnnuelle);
}
