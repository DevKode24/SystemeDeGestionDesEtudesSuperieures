package com.projet.dev.repository;

import com.projet.dev.models.Note;
import com.projet.dev.models.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SaisieNotesRepository extends JpaRepository<Note, Long> {

    Optional<Note> findByEtudiant_IdAndMatiere_IdAndAnneeAcademique_IdAndSession(
            Long etudiantId,
            Long matiereId,
            Long anneeAcademiqueId,
            Session session
    );

    List<Note> findByMatiere_IdAndAnneeAcademique_IdAndSession(
            Long matiereId,
            Long anneeAcademiqueId,
            Session session
    );

    List<Note> findByEtudiant_Id(Long etudiantId);
}
