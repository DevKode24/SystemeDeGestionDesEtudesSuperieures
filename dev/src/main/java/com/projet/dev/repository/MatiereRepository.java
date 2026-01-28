package com.projet.dev.repository;

import com.projet.dev.models.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatiereRepository extends JpaRepository<Matiere, Long> {

    List<Matiere> findByUeId(Long ueId);

    List<Matiere> findByEnseignantId(Long enseignantId);

    @Query("""
        SELECT m FROM Matiere m
        WHERE m.ue.semestre.id = :semestreId
    """)
    List<Matiere> findBySemestre(@Param("semestreId") Long semestreId);
}
