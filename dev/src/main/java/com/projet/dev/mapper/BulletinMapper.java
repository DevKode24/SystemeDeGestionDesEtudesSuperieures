package com.projet.dev.mapper;

import com.projet.dev.DTO.BulletinDto;
import com.projet.dev.models.Bulletin;
import com.projet.dev.models.DecisionBulletin;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
@Component
@RequiredArgsConstructor
public class BulletinMapper {

    private final ModelMapper modelMapper;

    public BulletinDto toDto(Bulletin bulletin) {
        BulletinDto dto = modelMapper.map(bulletin, BulletinDto.class);
        dto.setDecision(bulletin.getDecision().name());
        return dto;
    }

    public Bulletin toEntity(BulletinDto dto) {
        Bulletin bulletin = modelMapper.map(dto, Bulletin.class);
        bulletin.setDecision(
                DecisionBulletin.valueOf(dto.getDecision())
        );
        return bulletin;
    }
}
