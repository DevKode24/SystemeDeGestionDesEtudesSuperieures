package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.FiliereDto;
import com.projet.dev.models.Filiere;
import com.projet.dev.repository.FiliereRepository;
import com.projet.dev.services.FiliereService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional

public class FiliereServiceImpl implements FiliereService {

    private final FiliereRepository filiereRepository;
    private final ModelMapper modelMapper;

    public FiliereServiceImpl(FiliereRepository filiereRepository, ModelMapper modelMapper) {
        this.filiereRepository = filiereRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public FiliereDto creerFiliere(FiliereDto dto) {
        if (filiereRepository.existsByNom(dto.getNom()))
            throw new RuntimeException("Une filière avec ce nom existe déjà");
        if (filiereRepository.existsByCode(dto.getCode()))
            throw new RuntimeException("Une filière avec ce code existe déjà");

        Filiere filiere = modelMapper.map(dto, Filiere.class);
        Filiere saved = filiereRepository.save(filiere);
        return modelMapper.map(saved, FiliereDto.class);
    }

    @Override
    public FiliereDto modifierFiliere(Long id, FiliereDto dto) {
        Filiere filiere = filiereRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Filière introuvable"));

        filiere.setNom(dto.getNom());
        filiere.setCode(dto.getCode());

        return modelMapper.map(filiere, FiliereDto.class);
    }

    @Override
    public FiliereDto getFiliereById(Long id) {
        return filiereRepository.findById(id)
                .map(f -> modelMapper.map(f, FiliereDto.class))
                .orElseThrow(() -> new RuntimeException("Filière introuvable"));
    }

    @Override
    public List<FiliereDto> listerToutesLesFilieres() {
        return filiereRepository.findAll()
                .stream()
                .map(f -> modelMapper.map(f, FiliereDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public FiliereDto rechercherParCode(String code) {
        return filiereRepository.findByCode(code)
                .map(f -> modelMapper.map(f, FiliereDto.class))
                .orElseThrow(() -> new RuntimeException("Filière introuvable"));
    }

    @Override
    public void supprimerFiliere(Long filiereId) {
        filiereRepository.deleteById(filiereId);
    }
}
