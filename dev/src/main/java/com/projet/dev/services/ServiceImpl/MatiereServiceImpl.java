package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.MatiereDto;
import com.projet.dev.models.Matiere;
import com.projet.dev.models.UE;
import com.projet.dev.repository.MatiereRepository;
import com.projet.dev.repository.UERepository;
import com.projet.dev.services.MatiereService;
import com.projet.dev.mapper.MatiereMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MatiereServiceImpl implements MatiereService {

    private final MatiereRepository matiereRepository;
    private final UERepository ueRepository;
    private final MatiereMapper matiereMapper;

    public MatiereServiceImpl(MatiereRepository matiereRepository,
                              UERepository ueRepository,
                              MatiereMapper matiereMapper) {
        this.matiereRepository = matiereRepository;
        this.ueRepository = ueRepository;
        this.matiereMapper = matiereMapper;
    }

    /* ==========================
       CRUD MÉTIER
       ========================== */

    @Override
    public MatiereDto creerMatiere(MatiereDto dto) {
        Matiere matiere = matiereMapper.toEntity(dto);
        return matiereMapper.toDto(matiereRepository.save(matiere));
    }

    @Override
    public MatiereDto modifierMatiere(Long id, MatiereDto dto) {
        Matiere matiere = matiereRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));
        matiere.setIntitule(dto.getIntitule());
        matiere.setCode(dto.getCode());
        matiere.setCoefficient(dto.getCoefficient());
        return matiereMapper.toDto(matiere);
    }

    @Override
    public MatiereDto getMatiereById(Long id) {
        return matiereRepository.findById(id)
                .map(matiereMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));
    }

    @Override
    public List<MatiereDto> listerToutesLesMatieres() {
        return matiereMapper.toDtoList(matiereRepository.findAll());
    }

    /* ==========================
       LOGIQUE MÉTIER
       ========================== */

    @Override
    public List<MatiereDto> listerMatieresParUE(Long ueId) {
        return matiereMapper.toDtoList(matiereRepository.findByUeId(ueId));
    }

    @Override
    public void rattacherMatiereAUE(Long matiereId, Long ueId) {
        Matiere matiere = matiereRepository.findById(matiereId)
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));
        UE ue = ueRepository.findById(ueId)
                .orElseThrow(() -> new RuntimeException("UE introuvable"));
        matiere.setUe(ue);
    }

    @Override
    public void supprimerMatiere(Long matiereId) {
        Matiere matiere = matiereRepository.findById(matiereId)
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));
        matiereRepository.delete(matiere);
    }
}
