package com.projet.dev.mapper;

import com.projet.dev.DTO.SaisieNotesDto;
import com.projet.dev.models.Note;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SaisieNotesMapper {

    private final ModelMapper modelMapper;

    public SaisieNotesDto toDto(Note note) {
        return modelMapper.map(note, SaisieNotesDto.class);
    }

    public Note toEntity(SaisieNotesDto dto) {
        return modelMapper.map(dto, Note.class);
    }
}
