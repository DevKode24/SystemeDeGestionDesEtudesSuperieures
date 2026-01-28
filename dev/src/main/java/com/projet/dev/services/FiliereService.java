package com.projet.dev.services;

import com.projet.dev.DTO.FiliereDto;

import java.util.List;

public interface FiliereService {

    FiliereDto creerFiliere(FiliereDto filiereDto);

    FiliereDto modifierFiliere(Long filiereId, FiliereDto filiereDto);

    FiliereDto getFiliereById(Long filiereId);

    List<FiliereDto> listerToutesLesFilieres();

    FiliereDto rechercherParCode(String code);

    void supprimerFiliere(Long filiereId);
}
