package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.EnseignementDto;
import com.projet.dev.DTO.EtudiantNoteDto;
import com.projet.dev.mapper.EnseignementMapper;
import com.projet.dev.models.*;
import com.projet.dev.repository.*;
import com.projet.dev.services.EnseignementService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional

public class EnseignementServiceImpl implements EnseignementService {

    private final EnseignementRepository enseignementRepository;
    private final MatiereRepository matiereRepository;
    private final ClasseRepository classeRepository;
    private final EnseignantRepository enseignantRepository;
    private final EtudiantRepository etudiantRepository;
    private final EnseignementMapper mapper;

    public EnseignementServiceImpl(EnseignementRepository enseignementRepository,EtudiantRepository etudiantRepository, MatiereRepository matiereRepository, ClasseRepository classeRepository, EnseignantRepository enseignantRepository, EnseignementMapper mapper) {
        this.enseignementRepository = enseignementRepository;
        this.matiereRepository = matiereRepository;
        this.classeRepository = classeRepository;
        this.enseignantRepository = enseignantRepository;
        this.etudiantRepository = etudiantRepository;


        this.mapper = mapper;
    }

    @Override
    public EnseignementDto creerEnseignement(EnseignementDto dto) {

        Matiere matiere = matiereRepository.findById(dto.getMatiereId())
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));

        Classe classe = classeRepository.findById(dto.getClasseId())
                .orElseThrow(() -> new RuntimeException("Classe introuvable"));

        Enseignant enseignant = enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

        Enseignement e = new Enseignement();
        e.setMatiere(matiere);
        e.setClasse(classe);
        e.setEnseignant(enseignant);
        e.setActif(true);

        return mapper.toDto(enseignementRepository.save(e));
    }

    @Override
    public EnseignementDto modifierEnseignement(Long id, EnseignementDto dto) {

        Enseignement e = enseignementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignement introuvable"));

        e.setActif(dto.isActif());

        return mapper.toDto(enseignementRepository.save(e));
    }

    @Override
    public EnseignementDto getById(Long id) {
        return enseignementRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new RuntimeException("Enseignement introuvable"));
    }

    @Override
    public List<EnseignementDto> listerTous() {
        return mapper.toDtoList(enseignementRepository.findAll());
    }

    @Override
    public List<EnseignementDto> listerParClasse(Long classeId) {
        return mapper.toDtoList(
                enseignementRepository.findByClasseId(classeId)
        );
    }
    private Enseignant getEnseignantConnecte() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return enseignantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Enseignant connecté introuvable"));
    }


    /* ============================
       👨‍🏫 ENSEIGNANT CONNECTÉ
       ============================ */

    @Override
    public List<Classe> getMesClasses() {
        Enseignant enseignant = getEnseignantConnecte();
        return enseignementRepository
                .findClassesByEnseignantId(enseignant.getId());
    }

    @Override
    public List<Matiere> getMesMatieresParClasse(Long classeId) {
        Enseignant enseignant = getEnseignantConnecte();

        return enseignementRepository
                .findMatieresByClasseAndEnseignantEmail(
                        classeId,
                        enseignant.getEmail()
                );
    }

    @Override
    public List<Etudiant> getEtudiantsDeMaClasse(Long classeId) {

        Enseignant enseignant = getEnseignantConnecte();

        boolean enseigneDansClasse =
                !enseignementRepository
                        .findByEnseignantIdAndClasseId(enseignant.getId(), classeId)
                        .isEmpty();

        if (!enseigneDansClasse) {
            throw new RuntimeException(
                    "Accès refusé : vous n'enseignez pas dans cette classe"
            );
        }

        return etudiantRepository.findByClasseId(classeId);
    }

    @Override
    public List<EtudiantNoteDto> listerEtudiantsParClasse(Long classeId) {
        return etudiantRepository.findEtudiantsParClasse(classeId);
    }


    @Override
    public List<EnseignementDto> getMesEnseignements() {
        Enseignant enseignant = getEnseignantConnecte();
        return mapper.toDtoList(
                enseignementRepository.findByEnseignantId(enseignant.getId())
        );
    }


    @Override
    public List<EnseignementDto> listerParEnseignant(Long enseignantId) {
        return mapper.toDtoList(
                enseignementRepository.findByEnseignantId(enseignantId)
        );
    }

    @Override
    public void desactiver(Long id) {
        Enseignement e = enseignementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignement introuvable"));

        e.setActif(false);
        enseignementRepository.save(e);
    }
}
