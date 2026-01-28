package com.projet.dev.services;

import com.projet.dev.DTO.UserLightDto;


import java.util.List;

/**
 * SERVICE MÉTIER USER
 * -------------------
 * Gère les comptes utilisateurs du système académique :
 * - étudiants
 * - enseignants
 * - administration
 */
public interface UserService {

    /* ==========================
       GESTION DES COMPTES
       ========================== */

    UserLightDto creerUtilisateur(UserLightDto userDto);

    UserLightDto modifierUtilisateur(Long userId, UserLightDto userDto);

    UserLightDto getUtilisateurById(Long userId);

    UserLightDto getUtilisateurByEmail(String email);

    List<com.projet.dev.DTO.UserLightDto> listerTousLesUtilisateurs();


    /* ==========================
       GESTION MÉTIER
       ========================== */

    void activerCompte(Long userId);

    void desactiverCompte(Long userId);

    void changerMotDePasse(Long userId, String nouveauMotDePasse);

    boolean existeParEmail(String email);
}

