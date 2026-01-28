package com.projet.dev.services;

import com.projet.dev.DTO.NoteDto;
import java.util.List;

public interface NoteService {

    NoteDto enregistrerNote(NoteDto noteDto);

    NoteDto modifierNote(Long noteId, Double noteCC, Double noteExamen);

    void supprimerNote(Long noteId);

    NoteDto getNoteById(Long noteId);

    List<NoteDto> listerNotesParEtudiant(Long etudiantId);

    List<NoteDto> listerNotesParEtudiantEtAnnee(
            Long etudiantId,
            Long anneeAcademiqueId
    );

    double calculerNoteFinale(Long noteId);
}

