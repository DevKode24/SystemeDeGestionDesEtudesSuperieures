package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.NoteDto;
import com.projet.dev.mapper.NoteMapper;
import com.projet.dev.models.*;
import com.projet.dev.repository.*;
import com.projet.dev.services.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final NoteMapper noteMapper;
    private final EtudiantRepository etudiantRepository;
    private final MatiereRepository matiereRepository;
    private final AnneeAcademiqueRepository anneeAcademiqueRepository;

    @Override
    public NoteDto enregistrerNote(NoteDto dto) {

        Etudiant etudiant = etudiantRepository.findById(dto.getEtudiantId())
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        Matiere matiere = matiereRepository.findById(dto.getMatiereId())
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));

        AnneeAcademique annee = anneeAcademiqueRepository.findById(dto.getAnneeAcademiqueId())
                .orElseThrow(() -> new RuntimeException("Année académique introuvable"));

        Note note = noteRepository
                .findByEtudiant_IdAndMatiere_IdAndAnneeAcademique_IdAndSession(
                        etudiant.getId(),
                        matiere.getId(),
                        annee.getId(),
                        dto.getSession()
                )
                .orElse(new Note());

        note.setEtudiant(etudiant);
        note.setMatiere(matiere);
        note.setAnneeAcademique(annee);
        note.setSession(dto.getSession());

        note.setNoteCC(dto.getNoteCC());
        note.setNoteExamen(dto.getNoteExamen());
        note.setValeur(dto.getValeur());

        note.definirPoids(dto.getPourcentageCC(), dto.getPourcentageExamen());
        note.calculerNoteFinale();

        return noteMapper.toDto(noteRepository.save(note));
    }

    @Override
    public NoteDto modifierNote(Long id, Double cc, Double examen) {

        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note introuvable"));

        if (cc != null) note.setNoteCC(cc);
        if (examen != null) note.setNoteExamen(examen);

        note.calculerNoteFinale();
        return noteMapper.toDto(noteRepository.save(note));
    }

    @Override
    public void supprimerNote(Long noteId) {
        if (!noteRepository.existsById(noteId)) {
            throw new RuntimeException("Note introuvable");
        }
        noteRepository.deleteById(noteId);
    }

    @Override
    public NoteDto getNoteById(Long noteId) {
        return noteRepository.findById(noteId)
                .map(noteMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Note introuvable"));
    }

    @Override
    public List<NoteDto> listerNotesParEtudiant(Long etudiantId) {
        return noteMapper.toDtoList(
                noteRepository.findByEtudiant_Id(etudiantId)
        );
    }

    @Override
    public List<NoteDto> listerNotesParEtudiantEtAnnee(Long etudiantId, Long anneeAcademiqueId) {
        return noteMapper.toDtoList(
                noteRepository.findByEtudiant_IdAndAnneeAcademique_Id(etudiantId, anneeAcademiqueId)
        );
    }

    /*@Override
    public List<NoteDto> listerNotesParMatiere(Long matiereId) {
        return noteMapper.toDtoList(
                noteRepository.findByMatiere_Id(matiereId)
        );
    }

    @Override
    public List<NoteDto> listerNotesParMatiereClasse(Long matiereId, Long classeId) {
        return noteMapper.toDtoList(
                noteRepository.findByEtudiant_IdAndEAndEtudiant_Classe_Id(matiereId, classeId)
        );
    }*/

    @Override
    public double calculerNoteFinale(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note introuvable"));
        return note.getNoteFinale();
    }
}
