package com.projet.dev.mapper;

import com.projet.dev.DTO.FiliereDto;
import com.projet.dev.models.Filiere;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FiliereMapper {

    private final ModelMapper modelMapper;

    public FiliereMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public FiliereDto toDto(Filiere filiere) {
        return modelMapper.map(filiere, FiliereDto.class);
    }

    public Filiere toEntity(FiliereDto dto) {
        return modelMapper.map(dto, Filiere.class);
    }

    public List<FiliereDto> toDtoList(List<Filiere> filieres) {
        return filieres.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<Filiere> toEntityList(List<FiliereDto> dtos) {
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
