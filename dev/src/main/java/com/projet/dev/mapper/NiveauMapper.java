package com.projet.dev.mapper;

import com.projet.dev.DTO.NiveauDto;
import com.projet.dev.models.Niveau;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NiveauMapper {

    private final ModelMapper modelMapper;

    public NiveauMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public NiveauDto toDto(Niveau niveau) {
        if (niveau == null) {
            return null;
        }
        return modelMapper.map(niveau, NiveauDto.class);
    }

    public Niveau toEntity(NiveauDto dto) {
        if (dto == null) {
            return null;
        }
        return modelMapper.map(dto, Niveau.class);
    }

    public List<NiveauDto> toDtoList(List<Niveau> niveaux) {
        return niveaux.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<Niveau> toEntityList(List<NiveauDto> dtos) {
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}
