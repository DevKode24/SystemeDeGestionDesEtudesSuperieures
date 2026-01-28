package com.projet.dev.services;

import com.projet.dev.DTO.AnneeAcademiqueDto;
import com.projet.dev.DTO.SaisieNotesDto;

import java.util.List;

public interface SaisieNotesService {


    SaisieNotesDto chargerSaisieNotes(
            Long classeId,
            Long matiereId,
            Long anneeAcademiqueId
    );

    void enregistrerSaisieNotes(SaisieNotesDto dto);
}
