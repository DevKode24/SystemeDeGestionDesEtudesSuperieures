package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.ClasseDto;
import com.projet.dev.mapper.ClasseMapper;
import com.projet.dev.models.*;
import com.projet.dev.repository.*;
import com.projet.dev.services.ClasseService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ClasseServiceImpl implements ClasseService {

    private final ClasseRepository classeRepository;
    private final FiliereRepository filiereRepository;
    private final NiveauRepository niveauRepository;
    private final ClasseMapper classeMapper;

    public ClasseServiceImpl(ClasseRepository classeRepository, FiliereRepository filiereRepository, NiveauRepository niveauRepository, ClasseMapper classeMapper) {
        this.classeRepository = classeRepository;
        this.filiereRepository = filiereRepository;
        this.niveauRepository = niveauRepository;
        this.classeMapper = classeMapper;
    }

    @Override
    public ClasseDto creerClasse(ClasseDto dto) {

        Filiere filiere = filiereRepository.findById(dto.getFiliereId())
                .orElseThrow(() -> new RuntimeException("Filière introuvable"));

        Niveau niveau = niveauRepository.findById(dto.getNiveauId())
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));


        Classe classe = new Classe();
        classe.setCode(dto.getCode());
        classe.setFiliere(filiere);
        classe.setNiveau(niveau);
        classe.setActive(true);

        return classeMapper.toDto(classeRepository.save(classe));
    }

    @Override
    public ClasseDto modifierClasse(Long id, ClasseDto dto) {

        Classe classe = classeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classe introuvable"));

        classe.setCode(dto.getCode());
        classe.setActive(dto.isActive());

        return classeMapper.toDto(classeRepository.save(classe));
    }

    @Override
    public ClasseDto getClasseById(Long id) {
        return classeRepository.findById(id)
                .map(classeMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Classe introuvable"));
    }

    @Override
    public List<ClasseDto> listerClasses() {
        return classeMapper.toDtoList(classeRepository.findAll());
    }


    @Override
    public void desactiverClasse(Long id) {
        Classe classe = classeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classe introuvable"));

        classe.setActive(false);
        classeRepository.save(classe);
    }
}
