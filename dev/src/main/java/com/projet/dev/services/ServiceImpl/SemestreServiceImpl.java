package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.SemestreDto;
import com.projet.dev.models.UE;
import com.projet.dev.models.Semestre;
import com.projet.dev.repository.SemestreRepository;
import com.projet.dev.repository.UERepository;
import com.projet.dev.services.SemestreService;
import com.projet.dev.services.UEService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * IMPLÉMENTATION SEMESTRE
 * ----------------------
 * Applique fidèlement le calcul officiel des moyennes semestrielles.
 */
@Service
@Transactional
public class SemestreServiceImpl implements SemestreService {

    private final SemestreRepository semestreRepository;
    private final UERepository ueRepository;
    private final UEService ueService;
    private final ModelMapper modelMapper;

    public SemestreServiceImpl(SemestreRepository semestreRepository, UERepository ueRepository, UEService ueService, ModelMapper modelMapper) {
        this.semestreRepository = semestreRepository;
        this.ueRepository = ueRepository;
        this.ueService = ueService;
        this.modelMapper = modelMapper;
    }
 /* ==========================
       GESTION SEMESTRE
       ========================== */

    @Override
    public SemestreDto creerSemestre(SemestreDto dto) {
        Semestre semestre = modelMapper.map(dto, Semestre.class);
        Semestre saved = semestreRepository.save(semestre);
        return modelMapper.map(saved, SemestreDto.class);
    }

    @Override
    public List<SemestreDto> getAllSemestres() {
        return semestreRepository.findAll()
                .stream()
                .map(s -> modelMapper.map(s, SemestreDto.class))
                .collect(Collectors.toList());
    }
    @Override
    public SemestreDto modifierSemestre(Long id, SemestreDto dto) {
        Semestre semestre = semestreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Semestre introuvable"));
        modelMapper.map(dto, semestre);
        return modelMapper.map(semestre, SemestreDto.class);
    }

    @Override
    public SemestreDto getSemestreById(Long id) {
        Semestre semestre = semestreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Semestre introuvable"));
        return modelMapper.map(semestre, SemestreDto.class);
    }

    @Override
    public List<SemestreDto> getSemestresByAnneeAcademique(Long anneeId) {
        return semestreRepository.findByAnneeAcademiqueId(anneeId)
                .stream()
                .map(s -> modelMapper.map(s, SemestreDto.class))
                .collect(Collectors.toList());
    }

    /* ==========================
       CALCUL MOYENNE SEMESTRE
       ========================== */

    @Override
    public double calculerMoyenneSemestre(Long etudiantId, Long semestreId) {
        List<UE> ues = ueRepository.findBySemestreId(semestreId);

        double somme = 0;
        double totalCoef = 0;

        for (UE ue : ues) {
            double moyenneUE = ueService.calculerMoyenneUE(etudiantId, ue.getId());
            double coefUE = ue.getCoefficient() != null ? ue.getCoefficient() : 0;
            somme += moyenneUE * coefUE;
            totalCoef += coefUE;
        }

        return totalCoef == 0 ? 0 : somme / totalCoef;
    }
}