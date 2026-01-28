package com.projet.dev.mapper;

import com.projet.dev.DTO.EnseignementDto;
import com.projet.dev.models.Enseignement;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EnseignementMapper {

    public EnseignementDto toDto(Enseignement e) {
        if (e == null) return null;

        EnseignementDto dto = new EnseignementDto();
        dto.setId(e.getId());
        dto.setActif(e.isActif());

        dto.setMatiereId(e.getMatiere().getId());
        dto.setMatiereIntitule(e.getMatiere().getIntitule());

        dto.setClasseId(e.getClasse().getId());
        dto.setClasseCode(e.getClasse().getCode());

        dto.setEnseignantId(e.getEnseignant().getId());
        dto.setEnseignantNom(
                e.getEnseignant().getNom() + " " +
                        e.getEnseignant().getPrenom()
        );

        return dto;
    }

    public List<EnseignementDto> toDtoList(List<Enseignement> list) {
        return list.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
