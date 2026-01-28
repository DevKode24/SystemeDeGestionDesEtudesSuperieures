package com.projet.dev.services;

import com.projet.dev.DTO.ClasseDto;

import java.util.List;

public interface ClasseService {

    ClasseDto creerClasse(ClasseDto dto);

    ClasseDto modifierClasse(Long id, ClasseDto dto);

    ClasseDto getClasseById(Long id);

    List<ClasseDto> listerClasses();

    void desactiverClasse(Long id);
}
