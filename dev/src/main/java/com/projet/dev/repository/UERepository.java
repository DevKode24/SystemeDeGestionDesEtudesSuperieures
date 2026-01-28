package com.projet.dev.repository;

import com.projet.dev.models.Note;
import com.projet.dev.models.UE;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UERepository extends JpaRepository<UE, Long> {

    Optional<UE> findByCode(String code);

    List<UE> findBySemestreId(Long semestreId);


    @Query("""
        SELECT u FROM UE u
        JOIN u.semestre s
        WHERE s.anneeAcademique.id = :anneeId
    """)
    List<UE> findByAnneeAcademique(@Param("anneeId") Long anneeId);
}
