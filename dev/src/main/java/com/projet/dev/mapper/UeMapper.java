package com.projet.dev.mapper;

import com.projet.dev.DTO.UEsDto;
import com.projet.dev.models.UE;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UeMapper {

    private final ModelMapper modelMapper;

    public UeMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public UEsDto toDto(UE ue) {
        return modelMapper.map(ue, UEsDto.class);
    }

    public UE toEntity(UEsDto dto) {
        return modelMapper.map(dto, UE.class);
    }

    public List<UEsDto> toDtoList(List<UE> ues) {
        return ues.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<UE> toEntityList(List<UEsDto> dtos) {
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}
