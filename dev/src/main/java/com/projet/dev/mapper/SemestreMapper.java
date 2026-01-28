package com.projet.dev.mapper;

import com.projet.dev.DTO.SemestreDto;
import com.projet.dev.models.Semestre;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SemestreMapper {

    private final AnneeAcademiqueMapper anneeAcademiqueMapper;

    public SemestreMapper(AnneeAcademiqueMapper anneeAcademiqueMapper) {
        this.anneeAcademiqueMapper = anneeAcademiqueMapper;
    }

    // ===== ENTITY → DTO =====
    public SemestreDto toDto(Semestre semestre) {
        if (semestre == null) {
            return null;
        }

        SemestreDto dto = new SemestreDto();
        dto.setId(semestre.getId());
        dto.setNumero(semestre.getNumero());

        // mapping explicite de l’année académique
        if (semestre.getAnneeAcademique() != null) {
            dto.setAnneeAcademique(
                    anneeAcademiqueMapper.toDto(semestre.getAnneeAcademique())
            );
        }

        // ❌ on ne mappe PAS les UEs ici (évite PersistentBag)
        return dto;
    }

    // ===== DTO → ENTITY =====
    public Semestre toEntity(SemestreDto dto) {
        if (dto == null) {
            return null;
        }

        Semestre semestre = new Semestre();
        semestre.setId(dto.getId());
        semestre.setNumero(dto.getNumero());

        if (dto.getAnneeAcademique() != null) {
            semestre.setAnneeAcademique(
                    anneeAcademiqueMapper.toEntity(dto.getAnneeAcademique())
            );
        }

        return semestre;
    }

    // ===== LISTES =====
    public List<SemestreDto> toDtoList(List<Semestre> semestres) {
        return semestres == null ? List.of()
                : semestres.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<Semestre> toEntityList(List<SemestreDto> dtos) {
        return dtos == null ? List.of()
                : dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}
