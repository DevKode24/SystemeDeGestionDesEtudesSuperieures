package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.AnneeAcademiqueDto;
import com.projet.dev.models.AnneeAcademique;
import com.projet.dev.models.Semestre;
import com.projet.dev.repository.AnneeAcademiqueRepository;
import com.projet.dev.repository.SemestreRepository;
import com.projet.dev.services.AnneeAcademiqueService;
import com.projet.dev.services.SemestreService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * IMPLÉMENTATION ANNÉE ACADÉMIQUE
 * ------------------------------
 * Dernier niveau de consolidation académique.
 */
@Service
@Transactional
public class AnneeAcademiqueServiceImpl implements AnneeAcademiqueService {

    private final AnneeAcademiqueRepository anneeAcademiqueRepository;
    private final SemestreRepository semestreRepository;
    private final SemestreService semestreService;
    private final ModelMapper modelMapper;

    public AnneeAcademiqueServiceImpl(
            AnneeAcademiqueRepository anneeAcademiqueRepository,
            SemestreRepository semestreRepository,
            SemestreService semestreService,
            ModelMapper modelMapper
    ) {
        this.anneeAcademiqueRepository = anneeAcademiqueRepository;
        this.semestreRepository = semestreRepository;
        this.semestreService = semestreService;
        this.modelMapper = modelMapper;
    }

    /* ==========================
       GESTION ANNÉE ACADÉMIQUE
       ========================== */

    @Override
    public AnneeAcademiqueDto creerAnneeAcademique(AnneeAcademiqueDto dto) {
        AnneeAcademique annee = modelMapper.map(dto, AnneeAcademique.class);
        AnneeAcademique saved = anneeAcademiqueRepository.save(annee);
        return modelMapper.map(saved, AnneeAcademiqueDto.class);
    }

    @Override
    public AnneeAcademiqueDto getAnneeAcademiqueById(Long id) {
        AnneeAcademique annee = anneeAcademiqueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Année académique introuvable"));
        return modelMapper.map(annee, AnneeAcademiqueDto.class);
    }

    @Override
    public List<AnneeAcademiqueDto> listerToutesLesAnneesAcademiques() {
        return anneeAcademiqueRepository.findAll()
                .stream()
                .map(annee -> modelMapper.map(annee, AnneeAcademiqueDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public AnneeAcademiqueDto modifierAnneeAcademique(Long id, AnneeAcademiqueDto dto) {
        AnneeAcademique annee = anneeAcademiqueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Année académique introuvable"));

        annee.setLibelle(dto.getLibelle());

        AnneeAcademique updated = anneeAcademiqueRepository.save(annee);
        return modelMapper.map(updated, AnneeAcademiqueDto.class);
    }

    @Override
    public void supprimerAnneeAcademique(Long id) {
        if (!anneeAcademiqueRepository.existsById(id)) {
            throw new RuntimeException("Année académique introuvable");
        }
        anneeAcademiqueRepository.deleteById(id);
    }

    /* ==========================
       CALCUL MOYENNE ANNUELLE
       ========================== */

    @Override
    public double calculerMoyenneAnnuelle(Long etudiantId, Long anneeId) {
        List<Semestre> semestres = semestreRepository.findByAnneeAcademiqueId(anneeId);

        if (semestres.isEmpty()) return 0;

        double total = 0;
        for (Semestre semestre : semestres) {
            total += semestreService.calculerMoyenneSemestre(etudiantId, semestre.getId());
        }

        return total / semestres.size();
    }

    @Override
    public String determinerDecisionFinale(double moyenne) {
        if (moyenne >= 10) return "ADMIS";
        if (moyenne >= 8) return "AJOURNÉ";
        return "REDOUBLANT";
    }
}
