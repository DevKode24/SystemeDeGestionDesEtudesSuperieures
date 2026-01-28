package com.projet.dev.repository;

import com.projet.dev.models.Scolarite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ScolariteRepository extends JpaRepository<Scolarite, Long> {
    boolean existsByEmail(String email);
    Optional<Scolarite> findByEmail(String email);
}
