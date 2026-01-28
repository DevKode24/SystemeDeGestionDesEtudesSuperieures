package com.projet.dev.mapper;

import com.projet.dev.DTO.*;
import com.projet.dev.models.Etudiant;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EtudiantMapper {

    private final ModelMapper modelMapper;

    public EtudiantDto toDto(Etudiant e) {
        EtudiantDto dto = modelMapper.map(e, EtudiantDto.class);

        // 🔁 Rôles
        if (e.getRoles() != null) {
            dto.setRoles(
                    e.getRoles()
                            .stream()
                            .map(r -> r.getName().name())
                            .collect(Collectors.toSet())
            );
        }

        // ✅ Forcer le mapping des relations LAZY
        dto.setClasse(modelMapper.map(e.getClasse(), ClasseDto.class));
        dto.setFiliere(modelMapper.map(e.getFiliere(), FiliereDto.class));
        dto.setNiveau(modelMapper.map(e.getNiveau(), NiveauDto.class));
        dto.setAnneeAcademique(modelMapper.map(e.getAnneeAcademique(), AnneeAcademiqueDto.class));

        return dto;
    }

    public Etudiant toEntity(EtudiantDto dto) {
        return modelMapper.map(dto, Etudiant.class);
    }
}
