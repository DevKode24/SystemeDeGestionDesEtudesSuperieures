package com.projet.dev.mapper;

import com.projet.dev.DTO.NoteDto;
import com.projet.dev.models.Note;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class NoteMapper {

    private final ModelMapper modelMapper;

    public NoteDto toDto(Note note) {
        NoteDto dto = modelMapper.map(note, NoteDto.class);

        dto.setEtudiantId(note.getEtudiant().getId());
        dto.setMatiereId(note.getMatiere().getId());
        dto.setAnneeAcademiqueId(note.getAnneeAcademique().getId());
        dto.setAnneeAcademique(note.getAnneeAcademique().getLibelle());
        dto.setSession(note.getSession());

        return dto;
    }

    public Note toEntity(NoteDto dto) {
        return modelMapper.map(dto, Note.class);
    }

    public List<NoteDto> toDtoList(List<Note> notes) {
        return notes.stream().map(this::toDto).toList();
    }
}
