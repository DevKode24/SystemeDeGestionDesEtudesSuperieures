package com.projet.dev.config;

import com.projet.dev.models.*;
import com.projet.dev.repository.RoleRepository;
import com.projet.dev.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    @Transactional
    public CommandLineRunner initData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            /* ===================== ROLES ===================== */

            Role adminRole = roleRepository.findByName(ERole.ADMIN)
                    .orElseGet(() -> {
                        Role role = new Role(ERole.ADMIN);
                        role.setPermissions(new HashSet<>());
                        return roleRepository.save(role);
                    });

            roleRepository.findByName(ERole.SCOLARITE)
                    .orElseGet(() -> roleRepository.save(new Role(ERole.SCOLARITE)));

            roleRepository.findByName(ERole.ENSEIGNANT)
                    .orElseGet(() -> roleRepository.save(new Role(ERole.ENSEIGNANT)));

            roleRepository.findByName(ERole.ETUDIANT)
                    .orElseGet(() -> roleRepository.save(new Role(ERole.ETUDIANT)));

            /* ===================== ADMIN PAR DÉFAUT ===================== */

            String adminEmail = "admin@sges.com";

            if (!userRepository.existsByEmail(adminEmail)) {

                Enseignant admin = new Enseignant();
                admin.setNom("Super");
                admin.setPrenom("Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setEnabled(true);
                admin.setActif(true);
                admin.setSpecialite("Administration Système");
                admin.setGrade("SUPER_ADMIN");

                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                admin.setRoles(roles);

                userRepository.save(admin);

                System.out.println("✅ Administrateur par défaut créé : " + adminEmail);
            } else {
                System.out.println("ℹ️ Administrateur déjà existant");
            }
        };
    }
}
