package com.projet.dev.services.ServiceImpl;


import com.projet.dev.DTO.NiveauDto;
import com.projet.dev.models.Filiere;
import com.projet.dev.models.Niveau;
import com.projet.dev.repository.FiliereRepository;
import com.projet.dev.repository.NiveauRepository;
import com.projet.dev.services.NiveauService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * IMPLÉMENTATION NIVEAU
 * ---------------------
 * Centralise la logique métier liée aux niveaux académiques.
 */
@Service
@Transactional
public class NiveauServiceImpl implements NiveauService {

    private final NiveauRepository niveauRepository;
    private final FiliereRepository filiereRepository;
    private final ModelMapper modelMapper;

    public NiveauServiceImpl(NiveauRepository niveauRepository, FiliereRepository filiereRepository, ModelMapper modelMapper) {
        this.niveauRepository = niveauRepository;
        this.filiereRepository = filiereRepository;
        this.modelMapper = modelMapper;
    }

    /* ==========================
       CRUD MÉTIER
       ========================== */

    @Override
    public NiveauDto creerNiveau(NiveauDto dto) {
        Niveau niveau = modelMapper.map(dto, Niveau.class);
        return modelMapper.map(
                niveauRepository.save(niveau),
                NiveauDto.class
        );
    }

    @Override
    public NiveauDto modifierNiveau(Long id, NiveauDto dto) {
        Niveau niveau = niveauRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

        niveau.setLibelle(dto.getLibelle());
        niveau.setCode(dto.getCode());

        return modelMapper.map(niveau, NiveauDto.class);
    }

    @Override
    public NiveauDto getNiveauById(Long id) {
        return niveauRepository.findById(id)
                .map(n -> modelMapper.map(n, NiveauDto.class))
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));
    }

    @Override
    public List<NiveauDto> listerTousLesNiveaux() {
        return niveauRepository.findAll()
                .stream()
                .map(n -> modelMapper.map(n, NiveauDto.class))
                .collect(Collectors.toList());
    }

    /* ==========================
       LOGIQUE MÉTIER
       ========================== */

    @Override
    public List<NiveauDto> listerNiveauxParFiliere(Long filiereId) {
        return niveauRepository.findByFiliereId(filiereId)
                .stream()
                .map(n -> modelMapper.map(n, NiveauDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public void rattacherNiveauAFiliere(Long niveauId, Long filiereId) {
        Niveau niveau = niveauRepository.findById(niveauId)
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

        Filiere filiere = filiereRepository.findById(filiereId)
                .orElseThrow(() -> new RuntimeException("Filière introuvable"));

        niveau.setFiliere(filiere);
    }

    @Override
    public void supprimerNiveau(Long niveauId) {
        niveauRepository.deleteById(niveauId);
    }
}

