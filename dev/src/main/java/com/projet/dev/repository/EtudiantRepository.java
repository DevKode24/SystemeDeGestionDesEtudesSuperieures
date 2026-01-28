package com.projet.dev.repository;

import com.projet.dev.DTO.EtudiantNoteDto;
import com.projet.dev.models.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {

    /* ==========================
       EXISTENCE
       ========================== */
    boolean existsByEmail(String email);

    boolean existsByMatricule(String matricule);

    Optional<Etudiant> findByMatricule(String matricule);

    /* ==========================
       FILTRES SIMPLES
       ========================== */
    List<Etudiant> findByFiliereId(Long filiereId);

    List<Etudiant> findByNiveauId(Long niveauId);
    @Query("""
SELECT new com.projet.dev.DTO.EtudiantNoteDto(
    e.id,
    e.nom,
    e.prenom,
    e.matricule
)
FROM Etudiant e
JOIN e.classe c
WHERE c.id = :classeId
ORDER BY e.nom, e.prenom
""")
    List<EtudiantNoteDto> findEtudiantsParClasse(@Param("classeId") Long classeId);

    @Query("""
   SELECT e FROM Etudiant e
   JOIN e.classe c
   WHERE c.id = :classeId
""")
    List<Etudiant> findByClasseId(Long classeId);

    /* ==========================
       FILTRES ACADÉMIQUES
       ========================== */
    @Query("""
        SELECT e FROM Etudiant e
        WHERE e.filiere.id = :filiereId
        AND e.niveau.id = :niveauId
        AND e.anneeAcademique.id = :anneeId
    """)
    List<Etudiant> findByFiliereAndNiveauAndAnnee(
            @Param("filiereId") Long filiereId,
            @Param("niveauId") Long niveauId,
            @Param("anneeId") Long anneeAcademiqueId
    );

    @Query("""
        SELECT e FROM Etudiant e
        WHERE e.classe.id = :classeId
        AND e.anneeAcademique.id = :anneeId
    """)
    List<Etudiant> findByClasseAndAnnee(
            @Param("classeId") Long classeId,
            @Param("anneeId") Long anneeAcademiqueId
    );
}
