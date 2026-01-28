package com.projet.dev.mapper;

import com.projet.dev.DTO.ClasseDto;
import com.projet.dev.models.Classe;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ClasseMapper {

    public ClasseDto toDto(Classe classe) {
        if (classe == null) return null;

        ClasseDto dto = new ClasseDto();
        dto.setId(classe.getId());
        dto.setCode(classe.getCode());
        dto.setActive(classe.isActive());

        dto.setFiliereId(classe.getFiliere().getId());
        dto.setFiliereNom(classe.getFiliere().getNom());

        dto.setNiveauId(classe.getNiveau().getId());
        dto.setNiveauLibelle(classe.getNiveau().getLibelle());

        return dto;
    }

    public List<ClasseDto> toDtoList(List<Classe> classes) {
        return classes.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
