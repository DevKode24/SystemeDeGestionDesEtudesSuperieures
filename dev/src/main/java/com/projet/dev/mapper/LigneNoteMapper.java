package com.projet.dev.mapper;

        import com.projet.dev.DTO.LigneNoteDto;
        import com.projet.dev.models.Note;
        import lombok.RequiredArgsConstructor;
        import org.modelmapper.ModelMapper;
        import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LigneNoteMapper {

    private final ModelMapper modelMapper;

    public LigneNoteDto toDto(Note note) {
        LigneNoteDto dto = modelMapper.map(note, LigneNoteDto.class);
        dto.setEtudiantId(note.getEtudiant().getId());
        return dto;
    }

    public Note toEntity(LigneNoteDto dto) {
        Note note = modelMapper.map(dto, Note.class);
        return note;
    }
}
