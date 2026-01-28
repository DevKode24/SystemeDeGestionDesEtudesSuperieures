package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.EnseignantDto;
import com.projet.dev.DTO.LigneNoteDto;
import com.projet.dev.DTO.SaisieNotesDto;
import com.projet.dev.mapper.EnseignantMapper;
import com.projet.dev.models.*;
import com.projet.dev.repository.*;
import com.projet.dev.services.EnseignantService;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EnseignantServiceImpl implements EnseignantService {

    private final EnseignantRepository enseignantRepository;
    private final EtudiantRepository etudiantRepository;
    private final NoteRepository noteRepository;
    private final EnseignementRepository enseignementRepository;
    private final MatiereRepository matiereRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EnseignantMapper enseignantMapper;

    public EnseignantServiceImpl(EnseignantRepository enseignantRepository, EtudiantRepository etudiantRepository, NoteRepository noteRepository, AnneeAcademiqueRepository anneeAcademiqueRepository, MatiereRepository matiereRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, EnseignementRepository enseignementRepository, EnseignantMapper enseignantMapper) {
        this.enseignantRepository = enseignantRepository;
        this.etudiantRepository = etudiantRepository;
        this.noteRepository = noteRepository;
        this.enseignementRepository = enseignementRepository;
        this.matiereRepository = matiereRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.enseignantMapper = enseignantMapper;
    }

    /* ============================
           CRÉATION ENSEIGNANT
           ============================ */
    @Override
    public EnseignantDto creerEnseignant(EnseignantDto dto) {
        if (enseignantRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        Enseignant enseignant = new Enseignant();
        enseignant.setNom(dto.getNom());
        enseignant.setPrenom(dto.getPrenom());
        enseignant.setEmail(dto.getEmail());
        enseignant.setSpecialite(dto.getSpecialite());
        enseignant.setGrade(dto.getGrade());

        // 🔐 Sécurité : mot de passe encodé + compte actif
        enseignant.setPassword(passwordEncoder.encode(dto.getPassword()));
        enseignant.setEnabled(true);
        enseignant.setActif(true);

        // 🎓 Attribution du rôle ENSEIGNANT
        Role roleEnseignant = roleRepository.findByName(ERole.ENSEIGNANT)
                .orElseThrow(() -> new RuntimeException("Rôle ENSEIGNANT introuvable"));
        enseignant.setRoles(Collections.singleton(roleEnseignant));

        Enseignant saved = enseignantRepository.save(enseignant);
        return enseignantMapper.toDto(saved);
    }

    /* ============================
       MODIFICATION ENSEIGNANT
       ============================ */
    @Override
    public EnseignantDto modifierEnseignant(Long id, EnseignantDto dto) {
        Enseignant enseignant = enseignantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

        enseignant.setNom(dto.getNom());
        enseignant.setPrenom(dto.getPrenom());
        enseignant.setEmail(dto.getEmail());
        enseignant.setSpecialite(dto.getSpecialite());
        enseignant.setGrade(dto.getGrade());

        Enseignant saved = enseignantRepository.save(enseignant);
        return enseignantMapper.toDto(saved);
    }

    /* ============================
       CONSULTATION
       ============================ */
    @Override
    public EnseignantDto getEnseignantById(Long id) {
        Enseignant enseignant = enseignantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));
        return enseignantMapper.toDto(enseignant);
    }

    @Override
    public List<EnseignantDto> listerTousLesEnseignants() {
        return enseignantRepository.findAll()
                .stream()
                .map(enseignantMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<EnseignantDto> rechercherParSpecialite(String specialite) {
        return enseignantRepository.findBySpecialite(specialite)
                .stream()
                .map(enseignantMapper::toDto)
                .collect(Collectors.toList());
    }

    /* ============================
       AFFECTATION MATIÈRE
       ============================ */
    @Override
    public void affecterEnseignantAMatiere(Long enseignantId, Long matiereId) {
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

        Matiere matiere = matiereRepository.findById(matiereId)
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));

        matiere.setEnseignant(enseignant);

        if (!enseignant.getMatieres().contains(matiere)) {
            enseignant.getMatieres().add(matiere);
        }

        matiereRepository.save(matiere);
    }

    @Override
    public List<Classe> getClassesAffectees(Long enseignantId) {
        return enseignementRepository.findByEnseignantId(enseignantId)
                .stream()
                .map(Enseignement::getClasse)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public List<Matiere> getMatieresParClasse(Long enseignantId, Long classeId) {
        return enseignementRepository.findByEnseignantIdAndClasseId(enseignantId, classeId)
                .stream()
                .map(Enseignement::getMatiere)
                .distinct()
                .collect(Collectors.toList());
    }

}