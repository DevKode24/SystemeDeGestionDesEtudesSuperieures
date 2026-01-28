package com.projet.dev.services;

import com.projet.dev.DTO.ReleveNotesDto;
import com.projet.dev.models.ReleveNotes;

import java.util.List;

public interface ReleveNotesService {

    ReleveNotesDto creerReleve(ReleveNotesDto dto);

    ReleveNotesDto obtenirReleveParId(Long id);

    List<ReleveNotesDto> listerTousLesReleves();

    ReleveNotesDto mettreAJourReleve(Long id, ReleveNotesDto dto);

    void supprimerReleve(Long id);
}

