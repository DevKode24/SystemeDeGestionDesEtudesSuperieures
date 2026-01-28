package com.projet.dev.services;

import com.projet.dev.DTO.EnseignementDto;
import com.projet.dev.DTO.EtudiantNoteDto;
import com.projet.dev.models.Classe;
import com.projet.dev.models.Etudiant;
import com.projet.dev.models.Matiere;

import java.util.List;
public interface EnseignementService {

    /* ============================
       ADMIN / SCOLARITÉ
       ============================ */

    EnseignementDto creerEnseignement(EnseignementDto dto);

    EnseignementDto modifierEnseignement(Long id, EnseignementDto dto);

    EnseignementDto getById(Long id);

    List<EnseignementDto> listerTous();

    List<EnseignementDto> listerParClasse(Long classeId);

    List<EnseignementDto> listerParEnseignant(Long enseignantId);

    void desactiver(Long id);


    /* ============================
       👨‍🏫 ENSEIGNANT CONNECTÉ
       ============================ */

    List<Classe> getMesClasses();

    List<Matiere> getMesMatieresParClasse(Long classeId);
    List<Etudiant> getEtudiantsDeMaClasse(Long classeId);
    List<EtudiantNoteDto> listerEtudiantsParClasse(Long classeId);

    List<EnseignementDto> getMesEnseignements();
}
