package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.AnneeAcademiqueDto;
import com.projet.dev.DTO.LigneNoteDto;
import com.projet.dev.DTO.SaisieNotesDto;
import com.projet.dev.models.*;
import com.projet.dev.repository.*;
import com.projet.dev.services.SaisieNotesService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
@Service
@Transactional
public class SaisieNotesServiceImpl implements SaisieNotesService {

    private final EtudiantRepository etudiantRepository;
    private final NoteRepository noteRepository;
    private final MatiereRepository matiereRepository;
    private final AnneeAcademiqueRepository anneeAcademiqueRepository;

    public SaisieNotesServiceImpl(EtudiantRepository etudiantRepository, NoteRepository noteRepository, MatiereRepository matiereRepository, AnneeAcademiqueRepository anneeAcademiqueRepository) {
        this.etudiantRepository = etudiantRepository;
        this.noteRepository = noteRepository;
        this.matiereRepository = matiereRepository;
        this.anneeAcademiqueRepository = anneeAcademiqueRepository;
    }

    @Override
    public SaisieNotesDto chargerSaisieNotes(
            Long classeId,
            Long matiereId,
            Long anneeId
    ) {

        Matiere matiere = matiereRepository.findById(matiereId)
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));

        AnneeAcademique annee = anneeAcademiqueRepository.findById(anneeId)
                .orElseThrow(() -> new RuntimeException("Année académique introuvable"));

        List<Etudiant> etudiants =
                etudiantRepository.findByClasseId(classeId);

        List<Note> notes =
                noteRepository.findByMatiere_IdAndAnneeAcademique_IdAndEtudiant_Classe_Id(
                        matiereId, anneeId, classeId
                );

        var mapNotes = notes.stream()
                .collect(Collectors.toMap(
                        n -> n.getEtudiant().getId(),
                        n -> n
                ));

        List<LigneNoteDto> lignes = etudiants.stream().map(e -> {

            Note note = mapNotes.get(e.getId());

            LigneNoteDto l = new LigneNoteDto();
            l.setEtudiantId(e.getId());
            l.setNom(e.getNom());
            l.setPrenom(e.getPrenom());
            l.setMatricule(e.getMatricule());

            if (note != null) {
                l.setNoteCC(note.getNoteCC());
                l.setNoteDST(note.getNoteDST());
                l.setNoteSession(note.getNoteSession());
                l.setValeur(note.getNoteFinale());
            }

            return l;
        }).toList();

        SaisieNotesDto dto = new SaisieNotesDto();
        dto.setClasseId(classeId);
        dto.setMatiereId(matiereId);
        dto.setAnneeAcademiqueId(anneeId);
        dto.setLignes(lignes);

        return dto;
    }

    @Override
    public void enregistrerSaisieNotes(SaisieNotesDto dto) {

        Matiere matiere = matiereRepository.findById(dto.getMatiereId())
                .orElseThrow();

        AnneeAcademique annee = anneeAcademiqueRepository.findById(dto.getAnneeAcademiqueId())
                .orElseThrow();

        for (LigneNoteDto ligne : dto.getLignes()) {

            Etudiant etudiant = etudiantRepository.findById(ligne.getEtudiantId())
                    .orElseThrow();

            Note note = noteRepository
                    .findByEtudiant_IdAndMatiere_IdAndAnneeAcademique_Id(
                            etudiant.getId(),
                            matiere.getId(),
                            annee.getId()
                    )
                    .orElse(new Note());

            note.setEtudiant(etudiant);
            note.setMatiere(matiere);
            note.setAnneeAcademique(annee);

            note.setNoteCC(ligne.getNoteCC());
            note.setNoteDST(ligne.getNoteDST());
            note.setNoteSession(ligne.getNoteSession());

            note.recalculerToutesLesNotes();

            noteRepository.save(note);
        }
    }
}
