package com.projet.dev.mapper;

import com.projet.dev.DTO.AnneeAcademiqueDto;
import com.projet.dev.models.AnneeAcademique;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AnneeAcademiqueMapper {

    private final ModelMapper modelMapper;

    public AnneeAcademiqueMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public AnneeAcademiqueDto toDto(AnneeAcademique annee) {
        return modelMapper.map(annee, AnneeAcademiqueDto.class);
    }

    public AnneeAcademique toEntity(AnneeAcademiqueDto dto) {
        return modelMapper.map(dto, AnneeAcademique.class);
    }

    public List<AnneeAcademiqueDto> toDtoList(List<AnneeAcademique> annees) {
        return annees.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<AnneeAcademique> toEntityList(List<AnneeAcademiqueDto> dtos) {
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
