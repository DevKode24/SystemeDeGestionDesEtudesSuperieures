package com.projet.dev.repository;

import com.projet.dev.models.Classe;
import com.projet.dev.models.Enseignement;
import com.projet.dev.models.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface EnseignementRepository extends JpaRepository<Enseignement, Long> {

    /* ============================
       REQUÊTES EXISTANTES (OK)
       ============================ */

    List<Enseignement> findByClasseId(Long classeId);

    List<Enseignement> findByMatiereId(Long matiereId);

    List<Enseignement> findByEnseignantId(Long enseignantId);

    List<Enseignement> findByEnseignantIdAndClasseId(Long enseignantId, Long classeId);

    @Query("""
        SELECT DISTINCT e.classe
        FROM Enseignement e
        WHERE e.enseignant.id = :enseignantId
    """)
    List<Classe> findClassesByEnseignantId(Long enseignantId);


    /* ============================
       🔐 NOUVELLES REQUÊTES
       (ENSEIGNANT CONNECTÉ)
       ============================ */

    /**
     * Toutes les classes de l’enseignant connecté (par email)
     */
    @Query("""
        SELECT DISTINCT e.classe
        FROM Enseignement e
        WHERE e.enseignant.email = :email
    """)
    List<Classe> findClassesByEnseignantEmail(String email);

    /**
     * Toutes les matières de l’enseignant connecté dans une classe donnée
     */
    @Query("""
        SELECT DISTINCT e.matiere
        FROM Enseignement e
        WHERE e.enseignant.email = :email
          AND e.classe.id = :classeId
    """)
    List<Matiere> findMatieresByClasseAndEnseignantEmail(
            Long classeId,
            String email
    );


    /**
     * Vérifie si un enseignant enseigne dans une classe (sécurité)
     */
    boolean existsByClasseIdAndEnseignantEmail(Long classeId, String email);
}
