package com.projet.dev.config;

import com.projet.dev.models.Role;
import com.projet.dev.models.User;
import com.projet.dev.DTO.UserLightDto;
import org.modelmapper.AbstractConverter;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class MapperConfig {

    @Bean
    public ModelMapper modelMapper() {

        ModelMapper mapper = new ModelMapper();

        // 🔥 Converter Role -> String
        AbstractConverter<Set<Role>, Set<String>> roleToStringConverter =
                new AbstractConverter<>() {
                    @Override
                    protected Set<String> convert(Set<Role> source) {
                        if (source == null) return Set.of();
                        return source.stream()
                                .map(r -> r.getName().name())
                                .collect(Collectors.toSet());
                    }
                };

        // 🔥 Mapping User -> UserLightDto
        TypeMap<User, UserLightDto> userTypeMap =
                mapper.createTypeMap(User.class, UserLightDto.class);

        userTypeMap.addMappings(m ->
                m.using(roleToStringConverter)
                        .map(User::getRoles, UserLightDto::setRoles)
        );

        return mapper;
    }
}
