package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.UserLightDto;
import com.projet.dev.models.*;
import com.projet.dev.repository.RoleRepository;
import com.projet.dev.repository.UserRepository;
import com.projet.dev.services.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, ModelMapper modelMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
    }
    private User createUserByRole(String role) {
        return switch (role.toUpperCase()) {
            case "ADMIN" -> new Admin();
            case "SCOLARITE" -> new Scolarite();
            case "ETUDIANT" -> new Etudiant();
            case "ENSEIGNANT" -> new Enseignant();
            default -> throw new IllegalArgumentException("Rôle inconnu: " + role);
        };
    }


    @Override
    public UserLightDto creerUtilisateur(UserLightDto dto) {

        // ===== VALIDATIONS =====
        if (dto.getNom() == null || dto.getNom().trim().isEmpty()) {
            throw new RuntimeException("Le nom est obligatoire !");
        }
        if (dto.getPrenom() == null || dto.getPrenom().trim().isEmpty()) {
            throw new RuntimeException("Le prénom est obligatoire !");
        }
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new RuntimeException("L'email est obligatoire !");
        }
        if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Le mot de passe est obligatoire !");
        }
        if (dto.getRoles() == null || dto.getRoles().isEmpty()) {
            throw new RuntimeException("Au moins un rôle doit être défini !");
        }

        // Vérifier que l'email n'existe pas déjà
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + dto.getEmail());
        }

        // ===== CRÉATION DE L'UTILISATEUR SELON LE RÔLE =====
        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        User user;

        if (dto.getRoles().contains("ETUDIANT")) {
            user = new Etudiant(dto.getNom(), dto.getPrenom(), dto.getEmail(), encodedPassword);
        } else if (dto.getRoles().contains("ENSEIGNANT")) {
            user = new Enseignant(dto.getNom(), dto.getPrenom(), dto.getEmail(), encodedPassword);
        } else if (dto.getRoles().contains("SCOLARITE")) {
            user = new Scolarite(dto.getNom(), dto.getPrenom(), dto.getEmail(), encodedPassword);
        } else {
            user = new Admin(dto.getNom(), dto.getPrenom(), dto.getEmail(), encodedPassword);
        }

        // Activer le compte par défaut
        user.setActif(true);
        user.setEnabled(true);

        // ===== AJOUT DES ROLES =====
        Set<Role> roles = dto.getRoles().stream()
                .map(r -> roleRepository.findByName(ERole.valueOf(r))
                        .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + r)))
                .collect(Collectors.toSet());
        user.setRoles(roles);

        // ===== SAUVEGARDE EN BASE =====
        User saved = userRepository.save(user);

        // ===== RETOURNER DTO COMPLET =====
        return UserLightDto.fromEntity(saved);
    }


    /* ==========================
       MODIFICATION UTILISATEUR
       ========================== */
    @Override
    public UserLightDto modifierUtilisateur(Long userId, UserLightDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setEmail(dto.getEmail());

        if (dto.getRoles() != null) {
            Set<Role> roles = dto.getRoles().stream()
                    .map(r -> roleRepository.findByName(ERole.valueOf(r))
                            .orElseThrow(() -> new RuntimeException("Rôle introuvable : " + r)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        if(dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(dto.getPassword());
        }

        User saved = userRepository.save(user);

        UserLightDto response = modelMapper.map(saved, UserLightDto.class);
        response.setRoles(saved.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet())
        );

        return response;
    }

    /* ==========================
       CONSULTATION UTILISATEURS
       ========================== */
    @Override
    public UserLightDto getUtilisateurById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        UserLightDto dto = modelMapper.map(user, UserLightDto.class);
        dto.setRoles(user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet())
        );
        return dto;
    }

    @Override
    public UserLightDto getUtilisateurByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        UserLightDto dto = modelMapper.map(user, UserLightDto.class);
        dto.setRoles(user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet())
        );
        return dto;
    }

    @Override
    public List<UserLightDto> listerTousLesUtilisateurs() {
        return userRepository.findAll().stream()
                .map(user -> {
                    UserLightDto dto = modelMapper.map(user, UserLightDto.class);
                    dto.setRoles(user.getRoles().stream()
                            .map(role -> role.getName().name())
                            .collect(Collectors.toSet())
                    );
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /* ==========================
       GESTION COMPTE
       ========================== */
    @Override
    public void activerCompte(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setActif(true);
        userRepository.save(user);
    }

    @Override
    public void desactiverCompte(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setActif(false);
        userRepository.save(user);
    }

    @Override
    public void changerMotDePasse(Long userId, String nouveauMotDePasse) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setPassword(nouveauMotDePasse);
        userRepository.save(user);
    }

    @Override
    public boolean existeParEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
