package com.projet.dev.repository;

import com.projet.dev.models.Niveau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NiveauRepository extends JpaRepository<Niveau, Long> {

    Optional<Niveau> findByLibelle(String libelle);

    boolean existsByLibelle(String libelle);

    List<Niveau> findByFiliereId(Long filiereId);
}
