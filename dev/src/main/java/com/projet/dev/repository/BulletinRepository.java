package com.projet.dev.repository;

import com.projet.dev.models.Bulletin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface BulletinRepository extends JpaRepository<Bulletin, Long> {

    Optional<Bulletin> findByEtudiantIdAndAnneeAcademiqueId(
            Long etudiantId,
            Long anneeAcademiqueId
    );

    boolean existsByEtudiantIdAndAnneeAcademiqueId(
            Long etudiantId,
            Long anneeAcademiqueId
    );

    List<Bulletin> findByEtudiantId(Long etudiantId);
}
