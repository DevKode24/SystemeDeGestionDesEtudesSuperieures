package com.projet.dev.repository;

import com.projet.dev.models.Semestre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemestreRepository extends JpaRepository<Semestre, Long> {

    List<Semestre> findByAnneeAcademiqueId(Long anneeId);

    Optional<Semestre> findByNumeroAndAnneeAcademiqueId(Integer numero, Long anneeId);
}
