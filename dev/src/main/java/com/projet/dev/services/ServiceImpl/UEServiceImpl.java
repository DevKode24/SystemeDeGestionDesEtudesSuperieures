package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.UEsDto;
import com.projet.dev.models.Note;
import com.projet.dev.models.UE;
import com.projet.dev.repository.NoteRepository;
import com.projet.dev.repository.UERepository;
import com.projet.dev.services.UEService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UEServiceImpl implements UEService {

    private final UERepository ueRepository;
    private final NoteRepository noteRepository;
    private final ModelMapper modelMapper;

    public UEServiceImpl(UERepository ueRepository, NoteRepository noteRepository, ModelMapper modelMapper) {
        this.ueRepository = ueRepository;
        this.noteRepository = noteRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public List<UEsDto> getAllUEs() {
        return ueRepository.findAll()
                .stream()
                .map(ue -> modelMapper.map(ue, UEsDto.class))
                .collect(Collectors.toList());
    }

/* ==========================
       GESTION UE
       ========================== */

    @Override
    public UEsDto creerUE(UEsDto dto) {
        UE ue = modelMapper.map(dto, UE.class);
        UE saved = ueRepository.save(ue);
        return modelMapper.map(saved, UEsDto.class);
    }

    @Override
    public UEsDto modifierUE(Long ueId, UEsDto dto) {
        UE ue = ueRepository.findById(ueId)
                .orElseThrow(() -> new RuntimeException("UE introuvable"));

        modelMapper.map(dto, ue);
        return modelMapper.map(ue, UEsDto.class);
    }

    @Override
    public UEsDto getUEById(Long ueId) {
        return ueRepository.findById(ueId)
                .map(ue -> modelMapper.map(ue, UEsDto.class))
                .orElseThrow(() -> new RuntimeException("UE introuvable"));
    }

    @Override
    public List<UEsDto> getUEsBySemestre(Long semestreId) {
        return ueRepository.findBySemestreId(semestreId)
                .stream()
                .map(ue -> modelMapper.map(ue, UEsDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public void supprimerUE(Long ueId) {
        UE ue = ueRepository.findById(ueId)
                .orElseThrow(() -> new RuntimeException("UE introuvable"));
        ueRepository.delete(ue);
    }

    /* ==========================
       CALCUL MOYENNE UE
       ========================== */

    @Override
    public double calculerMoyenneUE(Long etudiantId, Long ueId) {

        var notes = noteRepository
                .findByEtudiant_IdAndMatiere_Ue_Id(etudiantId, ueId);

        double sommePonderee = 0.0;
        double coefficientTotal = 0.0;

        for (Note note : notes) {

            // Sécurité : on ignore les notes non encore finalisées
            if (note.getNoteFinale() == null) {
                continue;
            }

            double coefficient = note.getMatiere().getCoefficient();

            sommePonderee += note.getNoteFinale() * coefficient;
            coefficientTotal += coefficient;
        }

        return coefficientTotal == 0
                ? 0
                : sommePonderee / coefficientTotal;
    }
}
