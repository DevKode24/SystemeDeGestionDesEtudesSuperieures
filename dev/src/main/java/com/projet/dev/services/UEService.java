package com.projet.dev.services;

import com.projet.dev.DTO.UEsDto;

import java.util.List;

/**
 * SERVICE MÉTIER UE
 * -----------------
 * Gère :
 * - structure UE
 * - coefficients
 * - calcul moyenne UE
 * - crédits capitalisés
 */
public interface UEService {
    /**
     * Récupère toutes les UE existantes.
     *
     * @return Liste de DTO UEsDto
     */
    List<UEsDto> getAllUEs();

    /* ==========================
       GESTION UE
       ========================== */

    /**
     * Crée une nouvelle UE.
     *
     * @param ueDto DTO contenant les informations de l'UE
     * @return DTO de l'UE créée
     */
    UEsDto creerUE(UEsDto ueDto);

    /**
     * Modifie une UE existante.
     *
     * @param ueId  ID de l'UE à modifier
     * @param ueDto DTO contenant les nouvelles informations
     * @return DTO de l'UE modifiée
     */
    UEsDto modifierUE(Long ueId, UEsDto ueDto);

    /**
     * Récupère une UE par son ID.
     *
     * @param ueId ID de l'UE
     * @return DTO de l'UE
     */
    UEsDto getUEById(Long ueId);

    /**
     * Récupère toutes les UE d'un semestre.
     *
     * @param semestreId ID du semestre
     * @return Liste des DTO d'UE
     */
    List<UEsDto> getUEsBySemestre(Long semestreId);

    void supprimerUE(Long ueId);
    /* ==========================
       CALCULS ACADÉMIQUES
       ========================== */

    /**
     * Calcule la moyenne d'une UE pour un étudiant.
     * Moyenne UE = Σ(note finale matière × coef matière) / Σ(coef matière)
     *
     * @param etudiantId ID de l'étudiant
     * @param ueId       ID de l'UE
     * @return moyenne UE
     */
    double calculerMoyenneUE(Long etudiantId, Long ueId);
}
