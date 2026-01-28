package com.projet.dev.repository;


import com.projet.dev.models.ReleveNotes;
import com.projet.dev.models.TypeReleve;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReleveNotesRepository extends JpaRepository<ReleveNotes, Long> {

    Optional<ReleveNotes> findByEnseignantIdAndClasseIdAndMatiereIdAndAnneeAcademiqueIdAndTypeNote(
            Long enseignantId,
            Long classeId,
            Long matiereId,
            Long anneeAcademiqueId,
            TypeReleve typeNote
    );
}

