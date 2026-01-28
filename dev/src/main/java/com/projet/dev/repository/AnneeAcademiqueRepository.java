package com.projet.dev.repository;

import com.projet.dev.models.AnneeAcademique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnneeAcademiqueRepository extends JpaRepository<AnneeAcademique, Long> {

    Optional<AnneeAcademique> findByLibelle(String libelle);

    @Query("SELECT a FROM AnneeAcademique a ORDER BY a.id DESC")
    List<AnneeAcademique> findAllOrderByRecent();
}
