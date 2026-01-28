package com.projet.dev.services.ServiceImpl;

import com.projet.dev.models.ERole;
import com.projet.dev.models.Permission;
import com.projet.dev.models.Role;
import com.projet.dev.repository.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@Transactional
public class RoleServiceImpl {

    private final RoleRepository roleRepository;

    // ✅ Injection correcte
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /* ===================== CRUD ROLE ===================== */

    public Role creerRole(ERole roleName) {

        if (roleRepository.findByName(roleName).isPresent()) {
            throw new RuntimeException("Rôle déjà existant : " + roleName);
        }

        Role role = new Role(roleName);
        role.setPermissions(new HashSet<>()); // important

        return roleRepository.save(role);
    }

    /* ===================== AJOUT PERMISSION AU ROLE ===================== */

    public Role ajouterPermissionARole(ERole roleName, Permission permission) {

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() ->
                        new RuntimeException("Rôle introuvable : " + roleName));

        if (role.getPermissions() == null) {
            role.setPermissions(new HashSet<>());
        }

        role.getPermissions().add(permission);
        role.addPermission(permission);

        return roleRepository.save(role);
    }
}
