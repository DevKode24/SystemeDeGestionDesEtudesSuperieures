package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.*;
import com.projet.dev.mapper.EtudiantMapper;
import com.projet.dev.models.*;
import com.projet.dev.repository.*;
import com.projet.dev.services.EtudiantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class EtudiantServiceImpl implements EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final FiliereRepository filiereRepository;
    private final NiveauRepository niveauRepository;
    private final ClasseRepository classeRepository;
    private final AnneeAcademiqueRepository anneeAcademiqueRepository;
    private final RoleRepository roleRepository;
    private final NoteRepository noteRepository;
    private final UERepository ueRepository;
    private final SemestreRepository semestreRepository;
    private final PasswordEncoder passwordEncoder;
    private final EtudiantMapper etudiantMapper;

    private static final double TAUX_CC = 0.3;
    private static final double TAUX_EXAMEN = 0.7;

    public EtudiantServiceImpl(EtudiantRepository etudiantRepository, FiliereRepository filiereRepository, NiveauRepository niveauRepository, ClasseRepository classeRepository, AnneeAcademiqueRepository anneeAcademiqueRepository, RoleRepository roleRepository, NoteRepository noteRepository, UERepository ueRepository, SemestreRepository semestreRepository, PasswordEncoder passwordEncoder, EtudiantMapper etudiantMapper) {
        this.etudiantRepository = etudiantRepository;
        this.filiereRepository = filiereRepository;
        this.niveauRepository = niveauRepository;
        this.classeRepository = classeRepository;
        this.anneeAcademiqueRepository = anneeAcademiqueRepository;
        this.roleRepository = roleRepository;
        this.noteRepository = noteRepository;
        this.ueRepository = ueRepository;
        this.semestreRepository = semestreRepository;
        this.passwordEncoder = passwordEncoder;
        this.etudiantMapper = etudiantMapper;
    }

    /* ==========================
           CRÉATION ÉTUDIANT
           ========================== */
    @Override
    public EtudiantDto creerEtudiant(EtudiantDto dto) {

        if (etudiantRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        if (etudiantRepository.existsByMatricule(dto.getMatricule())) {
            throw new RuntimeException("Matricule déjà existant");
        }

        Etudiant e = new Etudiant();

        /* ===== USER ===== */
        e.setNom(dto.getNom());
        e.setPrenom(dto.getPrenom());
        e.setEmail(dto.getEmail());
        e.setPassword(passwordEncoder.encode(dto.getPassword()));
        e.setEnabled(true);
        e.setActif(true);

        /* ===== ACADÉMIQUE ===== */
        e.setMatricule(dto.getMatricule());
        e.setDateNaissance(dto.getDateNaissance());
        e.setDateInscription(
                dto.getDateInscription() != null ? dto.getDateInscription() : LocalDate.now()
        );

        /* ===== PERSONNEL ===== */
        e.setSexe(dto.getSexe());
        e.setNationalite(dto.getNationalite());
        e.setEtatCivil(dto.getEtatCivil());
        e.setLieuNaissance(dto.getLieuNaissance());

        /* ===== CONTACT ===== */
        e.setContactEtudiant(dto.getContactEtudiant());
        e.setContactUrgence(dto.getContactUrgence());
        e.setNomTuteur(dto.getNomTuteur());

        /* ===== STRUCTURE ===== */
        e.setFiliere(
                filiereRepository.findById(dto.getFiliere().getId())
                        .orElseThrow(() -> new RuntimeException("Filière introuvable"))
        );

        e.setNiveau(
                niveauRepository.findById(dto.getNiveau().getId())
                        .orElseThrow(() -> new RuntimeException("Niveau introuvable"))
        );

        e.setClasse(
                classeRepository.findById(dto.getClasse().getId())
                        .orElseThrow(() -> new RuntimeException("Classe introuvable"))
        );

        e.setAnneeAcademique(
                anneeAcademiqueRepository.findById(dto.getAnneeAcademique().getId())
                        .orElseThrow(() -> new RuntimeException("Année académique introuvable"))
        );

        /* ===== RÔLE ===== */
        Role roleEtudiant = roleRepository.findByName(ERole.ETUDIANT)
                .orElseThrow(() -> new RuntimeException("Rôle ETUDIANT introuvable"));

        e.setRoles(Set.of(roleEtudiant));

        return etudiantMapper.toDto(etudiantRepository.save(e));
    }

    /* ==========================
       MODIFICATION
       ========================== */
    @Override
    public EtudiantDto modifierEtudiant(Long id, EtudiantDto dto) {

        Etudiant e = etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        e.setNom(dto.getNom());
        e.setPrenom(dto.getPrenom());
        e.setMatricule(dto.getMatricule());
        e.setDateNaissance(dto.getDateNaissance());
        e.setDateInscription(dto.getDateInscription());
        e.setSexe(dto.getSexe());
        e.setNationalite(dto.getNationalite());
        e.setEtatCivil(dto.getEtatCivil());
        e.setLieuNaissance(dto.getLieuNaissance());
        e.setContactEtudiant(dto.getContactEtudiant());
        e.setContactUrgence(dto.getContactUrgence());
        e.setNomTuteur(dto.getNomTuteur());

        if (dto.getFiliere() != null)
            e.setFiliere(filiereRepository.findById(dto.getFiliere().getId()).orElseThrow());

        if (dto.getNiveau() != null)
            e.setNiveau(niveauRepository.findById(dto.getNiveau().getId()).orElseThrow());

        if (dto.getClasse() != null)
            e.setClasse(classeRepository.findById(dto.getClasse().getId()).orElseThrow());

        if (dto.getAnneeAcademique() != null)
            e.setAnneeAcademique(
                    anneeAcademiqueRepository.findById(dto.getAnneeAcademique().getId()).orElseThrow()
            );

        return etudiantMapper.toDto(etudiantRepository.save(e));
    }

    /* ==========================
       CONSULTATION
       ========================== */
    @Override
    public EtudiantDto rechercherParId(Long id) {
        return etudiantRepository.findById(id)
                .map(etudiantMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));
    }

    @Override
    public EtudiantDto rechercherParMatricule(String matricule) {
        return etudiantRepository.findByMatricule(matricule)
                .map(etudiantMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));
    }

    @Override
    public List<EtudiantDto> listerTousLesEtudiants() {
        return etudiantRepository.findAll()
                .stream()
                .map(etudiantMapper::toDto)
                .collect(Collectors.toList());
    }

    /* ==========================
       PARAMÈTRES
       ========================== */
    @Override public double getTauxCC() { return TAUX_CC; }
    @Override public double getTauxExamen() { return TAUX_EXAMEN; }

    /* ==========================
       CALCULS
       ========================== */
    @Override
    public double calculerNoteFinaleMatiere(double cc, double examen) {
        return cc * TAUX_CC + examen * TAUX_EXAMEN;
    }

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


    @Override
    public double calculerMoyenneSemestre(Long etudiantId, Long semestreId) {
        var ues = ueRepository.findBySemestreId(semestreId);
        double total = 0, coefTotal = 0;

        for (UE ue : ues) {
            double moy = calculerMoyenneUE(etudiantId, ue.getId());
            total += moy * ue.getCoefficient();
            coefTotal += ue.getCoefficient();
        }
        return coefTotal == 0 ? 0 : total / coefTotal;
    }

    @Override
    public double calculerMoyenneAnnuelle(Long etudiantId, Long anneeId) {
        var semestres = semestreRepository.findByAnneeAcademiqueId(anneeId);
        if (semestres.isEmpty()) return 0;

        double somme = 0;
        for (Semestre s : semestres) {
            somme += calculerMoyenneSemestre(etudiantId, s.getId());
        }
        return somme / semestres.size();
    }

    @Override
    public String determinerDecisionFinale(double moyenne) {
        if (moyenne >= 10) return "ADMIS";
        if (moyenne >= 8) return "AJOURNÉ";
        return "REDOUBLANT";
    }

    @Override
    public ReleveNotesDto obtenirSyntheseAcademique(Long etudiantId, Long anneeAcademiqueId) {
        return null;
    }
}
