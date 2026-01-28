package com.projet.dev.repository;

import com.projet.dev.models.Enseignant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnseignantRepository extends JpaRepository<Enseignant, Long> {

    List<Enseignant> findBySpecialite(String specialite);
    Optional<Enseignant> findByEmail(String email);

    boolean existsByEmail(String email);


}
