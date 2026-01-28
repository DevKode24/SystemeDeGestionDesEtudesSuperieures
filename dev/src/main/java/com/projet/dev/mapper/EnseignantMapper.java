package com.projet.dev.mapper;

import com.projet.dev.DTO.EnseignantDto;
import com.projet.dev.models.Enseignant;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class EnseignantMapper {

    private final ModelMapper modelMapper;

    public EnseignantMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public EnseignantDto toDto(Enseignant enseignant) {
        EnseignantDto dto = modelMapper.map(enseignant, EnseignantDto.class);

        // 🔁 Mapper correctement les rôles en String pour le JSON
        if (enseignant.getRoles() != null) {
            dto.setRoles(
                    enseignant.getRoles()
                            .stream()
                            .map(role -> role.getName().name()) // ERole -> "ENSEIGNANT"
                            .collect(Collectors.toSet())
            );
        }

        return dto;
    }

    public Enseignant toEntity(EnseignantDto dto) {
        return modelMapper.map(dto, Enseignant.class);
    }
}
