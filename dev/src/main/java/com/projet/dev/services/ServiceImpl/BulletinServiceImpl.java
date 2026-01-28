package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.BulletinDto;
import com.projet.dev.DTO.NoteDto;
import com.projet.dev.mapper.BulletinMapper;
import com.projet.dev.models.*;
import com.projet.dev.repository.*;
import com.projet.dev.services.BulletinService;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BulletinServiceImpl implements BulletinService {

    private final BulletinRepository bulletinRepository;
    private final EtudiantRepository etudiantRepository;
    private final AnneeAcademiqueRepository anneeAcademiqueRepository;
    private final MatiereRepository matiereRepository;
    private final NoteRepository noteRepository;
    private final BulletinMapper bulletinMapper;
    private final ModelMapper modelMapper;

    public BulletinServiceImpl(BulletinRepository bulletinRepository, EtudiantRepository etudiantRepository, AnneeAcademiqueRepository anneeAcademiqueRepository, MatiereRepository matiereRepository, NoteRepository noteRepository, BulletinMapper bulletinMapper, ModelMapper modelMapper) {
        this.bulletinRepository = bulletinRepository;
        this.etudiantRepository = etudiantRepository;
        this.anneeAcademiqueRepository = anneeAcademiqueRepository;
        this.matiereRepository = matiereRepository;
        this.noteRepository = noteRepository;
        this.bulletinMapper = bulletinMapper;
        this.modelMapper = modelMapper;
    }

    /* ==========================
       GÉNÉRATION BULLETIN
       ========================== */

    @Override
    public BulletinDto genererBulletinAnnuel(Long etudiantId, Long anneeAcademiqueId) {

        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new EntityNotFoundException("Étudiant introuvable"));

        AnneeAcademique annee = anneeAcademiqueRepository.findById(anneeAcademiqueId)
                .orElseThrow(() -> new EntityNotFoundException("Année académique introuvable"));

        double moyenne = calculerMoyenneAnnuelle(etudiantId, anneeAcademiqueId);
        DecisionBulletin decision = DecisionBulletin.valueOf(determinerDecisionFinale(moyenne));

        // Récupérer le dernier bulletin pour cet étudiant et cette année
        List<Bulletin> bulletinsExistants = bulletinRepository
                .findByEtudiantIdAndAnneeAcademiqueId(etudiantId, anneeAcademiqueId)
                .stream()
                .sorted((b1, b2) -> b2.getDateGeneration().compareTo(b1.getDateGeneration()))
                .toList();



        Bulletin bulletin = Bulletin.builder()
                .etudiant(etudiant)
                .anneeAcademique(annee)
                .moyenneAnnuelle(moyenne)
                .decision(decision)
                .dateGeneration(LocalDate.now())
                .verrouille(false)
                .build();

        bulletinRepository.save(bulletin);

        BulletinDto dto = bulletinMapper.toDto(bulletin);
        dto.setNotes(recupererNotes(etudiantId, anneeAcademiqueId));

        return dto;
    }


    /* ==========================
       CALCUL MOYENNE ANNUELLE
       ========================== */

    @Override
    public double calculerMoyenneAnnuelle(Long etudiantId, Long anneeAcademiqueId) {

        List<Matiere> matieres = matiereRepository.findAll();

        double totalCoef = matieres.stream()
                .mapToDouble(Matiere::getCoefficient)
                .sum();

        if (totalCoef == 0) {
            throw new RuntimeException("Aucun coefficient défini");
        }

        double sommePonderee = matieres.stream()
                .mapToDouble(matiere -> {

                    Note note = (Note) noteRepository
                            .findByEtudiantIdAndMatiereIdAndAnneeAcademique_Id(
                                    etudiantId,
                                    matiere.getId(),
                                    anneeAcademiqueId
                            )
                            .orElseThrow(() -> new RuntimeException(
                                    "Note manquante pour la matière : " + matiere.getIntitule()
                            ));

                    return note.getNoteFinale() * matiere.getCoefficient();
                })
                .sum();

        return sommePonderee / totalCoef;
    }

    @Override
    public List<NoteDto> recupererNotes(Long etudiantId, Long anneeAcademiqueId) {
        return noteRepository
                .findByEtudiantIdAndAnneeAcademique_Id(etudiantId, anneeAcademiqueId)
                .stream()
                .map(note -> modelMapper.map(note, NoteDto.class))
                .collect(Collectors.toList());
    }

    /* ==========================
       DÉCISION
       ========================== */

    @Override
    public String determinerDecisionFinale(double moyenne) {
        if (moyenne >= 10) return "ADMIS";
        if (moyenne >= 8) return "AJOURNÉ";
        return "REDOUBLANT";
    }

    /* ==========================
       VERROUILLAGE
       ========================== */

    @Override
    public void verrouillerBulletin(Long bulletinId) {
        Bulletin bulletin = bulletinRepository.findById(bulletinId)
                .orElseThrow(() -> new RuntimeException("Bulletin introuvable"));
        bulletin.setVerrouille(true);
    }

    @Override
    public boolean bulletinEstVerrouille(Long bulletinId) {
        return bulletinRepository.findById(bulletinId)
                .map(Bulletin::isVerrouille)
                .orElse(false);
    }

    /* ==========================
       CONSULTATION
       ========================== */

    @Override
    public List<BulletinDto> getBulletinsByEtudiant(Long etudiantId) {
        return bulletinRepository.findByEtudiantId(etudiantId)
                .stream()
                .map(bulletinMapper::toDto)
                .collect(Collectors.toList());
    }
}
