package com.projet.dev.repository;

import com.projet.dev.models.Classe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClasseRepository extends JpaRepository<Classe, Long> {

    Optional<Classe> findByCode(String code);


    List<Classe> findByFiliereIdAndNiveauId(Long filiereId, Long niveauId);
}

