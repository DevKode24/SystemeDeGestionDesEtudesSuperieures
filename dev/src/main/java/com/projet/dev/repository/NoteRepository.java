package com.projet.dev.repository;

import com.projet.dev.models.Note;
import com.projet.dev.models.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    /* ==========================
       RECHERCHES SIMPLES
       ========================== */

    List<Note> findByEtudiant_Id(Long etudiantId);

    List<Note> findByMatiere_Id(Long matiereId);

    /* ==========================
       PAR ANNÉE ACADÉMIQUE
       ========================== */

    List<Note> findByEtudiant_IdAndAnneeAcademique_Id(
            Long etudiantId,
            Long anneeAcademiqueId
    );

    /* ==========================
       NOTE UNIQUE PAR SESSION
       ========================== */

    Optional<Note> findByEtudiant_IdAndMatiere_IdAndAnneeAcademique_IdAndSession(
            Long etudiantId,
            Long matiereId,
            Long anneeAcademiqueId,
            Session session
    );

    /* ==========================
       PAR MATIÈRE / UE
       ========================== */

    List<Note> findByEtudiant_IdAndAndEtudiant_Classe_Id(
            Long etudiantId,
            Long matiereId
    );

    List<Note> findByEtudiant_IdAndMatiere_Ue_Id(
            Long etudiantId,
            Long ueId
    );
    List<Note>findByMatiere_IdAndAnneeAcademique_IdAndEtudiant_Classe_Id(Long matiereId, Long anneeId, Long classeId);


    /* ==========================
       NOTE UNIQUE SANS SESSION
       ========================== */

    Optional<Note> findByEtudiant_IdAndMatiere_IdAndAnneeAcademique_Id(
            Long etudiantId,
            Long matiereId,
            Long anneeAcademiqueId
    );

    Optional<Object> findByEtudiantIdAndMatiereIdAndAnneeAcademique_Id(Long etudiantId, Long id, Long anneeAcademiqueId);

    void findByEtudiantIdAndMatiere_Ue_Id(Long etudiantId, Long ueId);

    Collection<Object> findByEtudiantIdAndAnneeAcademique_Id(Long etudiantId, Long anneeAcademiqueId);
}
