package com.projet.dev.mapper;

import com.projet.dev.DTO.UserLightDto;
import com.projet.dev.models.User;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component

public class UserMapper {

    private final ModelMapper modelMapper;

    public UserMapper(ModelMapper modelMapper){
        this.modelMapper = modelMapper;
    }

    public UserLightDto toDto(User user) {
        return modelMapper.map(user, UserLightDto.class);
    }

    public User toEntity(UserLightDto dto) {
        return modelMapper.map(dto, User.class);
    }

    public List<User> toEntityList(List<UserLightDto> dtos) {
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
    public List<UserLightDto> toDtoList(List<User> users) {
        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
