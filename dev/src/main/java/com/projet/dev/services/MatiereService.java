package com.projet.dev.services;

import com.projet.dev.DTO.MatiereDto;
import java.util.List;

public interface MatiereService {

    /* ==========================
       CRUD MÉTIER
       ========================== */

    MatiereDto creerMatiere(MatiereDto matiereDto);

    MatiereDto modifierMatiere(Long matiereId, MatiereDto matiereDto);

    MatiereDto getMatiereById(Long matiereId);

    List<MatiereDto> listerToutesLesMatieres();

    /* ==========================
       LOGIQUE MÉTIER
       ========================== */

    List<MatiereDto> listerMatieresParUE(Long ueId);

    void rattacherMatiereAUE(Long matiereId, Long ueId);

    void supprimerMatiere(Long matiereId);
}
