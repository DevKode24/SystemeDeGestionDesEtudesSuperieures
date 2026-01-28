package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.AdminDto;
import com.projet.dev.models.Admin;
import com.projet.dev.repository.AdminRepository;
import com.projet.dev.services.AdminService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminServiceImpl(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AdminDto creerAdmin(AdminDto dto) {
        if (adminRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + dto.getEmail());
        }

        Admin admin = new Admin(
                dto.getNom(),
                dto.getPrenom(),
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword())
        );
        admin.setActif(true);
        admin.setEnabled(true);

        Admin saved = adminRepository.save(admin);
        return AdminDto.fromEntity(saved);
    }

    @Override
    public AdminDto modifierAdmin(Long id, AdminDto dto) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin introuvable"));

        admin.setNom(dto.getNom());
        admin.setPrenom(dto.getPrenom());
        admin.setEmail(dto.getEmail());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return AdminDto.fromEntity(adminRepository.save(admin));
    }

    @Override
    public AdminDto getAdminById(Long id) {
        return AdminDto.fromEntity(
                adminRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Admin introuvable"))
        );
    }

    @Override
    public AdminDto getAdminByEmail(String email) {
        return AdminDto.fromEntity(
                adminRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Admin introuvable"))
        );
    }

    @Override
    public List<AdminDto> listerTousAdmins() {
        return adminRepository.findAll().stream()
                .map(AdminDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void activerCompte(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin introuvable"));
        admin.setActif(true);
        adminRepository.save(admin);
    }

    @Override
    public void desactiverCompte(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin introuvable"));
        admin.setActif(false);
        adminRepository.save(admin);
    }

    @Override
    public void changerMotDePasse(Long id, String nouveauMotDePasse) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin introuvable"));
        admin.setPassword(passwordEncoder.encode(nouveauMotDePasse));
        adminRepository.save(admin);
    }
}
