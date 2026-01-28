package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.ScolariteDto;
import com.projet.dev.models.Scolarite;
import com.projet.dev.repository.ScolariteRepository;
import com.projet.dev.services.ScolariteService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScolariteServiceImpl implements ScolariteService {

    private final ScolariteRepository scolariteRepository;
    private final PasswordEncoder passwordEncoder;

    public ScolariteServiceImpl(ScolariteRepository scolariteRepository, PasswordEncoder passwordEncoder) {
        this.scolariteRepository = scolariteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public ScolariteDto creerScolarite(ScolariteDto dto) {
        if (scolariteRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + dto.getEmail());
        }

        Scolarite scolarite = new Scolarite(
                dto.getNom(),
                dto.getPrenom(),
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword())
        );
        scolarite.setActif(true);
        scolarite.setEnabled(true);

        Scolarite saved = scolariteRepository.save(scolarite);

        return ScolariteDto.fromEntity(saved);
    }

    @Override
    public ScolariteDto modifierScolarite(Long id, ScolariteDto dto) {
        Scolarite scolarite = scolariteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scolarité introuvable"));

        scolarite.setNom(dto.getNom());
        scolarite.setPrenom(dto.getPrenom());
        scolarite.setEmail(dto.getEmail());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            scolarite.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return ScolariteDto.fromEntity(scolariteRepository.save(scolarite));
    }

    @Override
    public ScolariteDto getScolariteById(Long id) {
        return ScolariteDto.fromEntity(
                scolariteRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Scolarité introuvable"))
        );
    }

    @Override
    public ScolariteDto getScolariteByEmail(String email) {
        return ScolariteDto.fromEntity(
                scolariteRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Scolarité introuvable"))
        );
    }

    @Override
    public List<ScolariteDto> listerToutesScolarites() {
        return scolariteRepository.findAll().stream()
                .map(ScolariteDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void activerCompte(Long id) {
        Scolarite scolarite = scolariteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scolarité introuvable"));
        scolarite.setActif(true);
        scolariteRepository.save(scolarite);
    }

    @Override
    public void desactiverCompte(Long id) {
        Scolarite scolarite = scolariteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scolarité introuvable"));
        scolarite.setActif(false);
        scolariteRepository.save(scolarite);
    }

    @Override
    public void changerMotDePasse(Long id, String nouveauMotDePasse) {
        Scolarite scolarite = scolariteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scolarité introuvable"));
        scolarite.setPassword(passwordEncoder.encode(nouveauMotDePasse));
        scolariteRepository.save(scolarite);
    }
}
