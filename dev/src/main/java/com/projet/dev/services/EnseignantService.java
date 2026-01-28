package com.projet.dev.services;

import com.projet.dev.DTO.EnseignantDto;
import com.projet.dev.DTO.SaisieNotesDto;
import com.projet.dev.models.Classe;
import com.projet.dev.models.Matiere;

import java.util.List;

public interface EnseignantService {

    EnseignantDto creerEnseignant(EnseignantDto enseignantDto);

    EnseignantDto modifierEnseignant(Long enseignantId, EnseignantDto enseignantDto);

    EnseignantDto getEnseignantById(Long enseignantId);

    List<EnseignantDto> listerTousLesEnseignants();

    List<EnseignantDto> rechercherParSpecialite(String specialite);

    void affecterEnseignantAMatiere(Long enseignantId, Long matiereId);


    /* ==============================
       NOUVEAU : Gestion des notes
       ============================== */

    // Liste des classes où l'enseignant est affecté
    List<Classe> getClassesAffectees(Long enseignantId);

    // Liste des matières pour une classe donnée et un enseignant
    List<Matiere> getMatieresParClasse(Long enseignantId, Long classeId);


}
