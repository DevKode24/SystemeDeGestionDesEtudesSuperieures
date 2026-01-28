package com.projet.dev.repository;

import com.projet.dev.models.Filiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FiliereRepository extends JpaRepository<Filiere, Long> {

    Optional<Filiere> findByNom(String nom);

    Optional<Filiere> findByCode(String code); // recherche par code

    boolean existsByNom(String nom);

    boolean existsByCode(String code); // vérifie l'unicité du code
}
