package com.projet.dev.mapper;

import com.projet.dev.DTO.MatiereDto;
import com.projet.dev.models.Matiere;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MatiereMapper {

    private final ModelMapper modelMapper;

    public MatiereMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public MatiereDto toDto(Matiere matiere) {
        return modelMapper.map(matiere, MatiereDto.class);
    }

    public Matiere toEntity(MatiereDto dto) {
        return modelMapper.map(dto, Matiere.class);
    }

    public List<MatiereDto> toDtoList(List<Matiere> matieres) {
        return matieres.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<Matiere> toEntityList(List<MatiereDto> dtos) {
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
