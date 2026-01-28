package com.projet.dev.services;

import com.projet.dev.DTO.NiveauDto;

import java.util.List;

public interface NiveauService {

    // CRUD
    NiveauDto creerNiveau(NiveauDto niveauDto);

    NiveauDto modifierNiveau(Long niveauId, NiveauDto niveauDto);

    NiveauDto getNiveauById(Long niveauId);

    List<NiveauDto> listerTousLesNiveaux();

    // Logique métier
    List<NiveauDto> listerNiveauxParFiliere(Long filiereId);

    void rattacherNiveauAFiliere(Long niveauId, Long filiereId);

    void supprimerNiveau(Long niveauId);
}
