package com.projet.dev.models;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public enum ERole {

    ADMIN(Set.of(
            Permission.ADMIN_READ,
            Permission.ADMIN_CREATE,
            Permission.ADMIN_UPDATE,
            Permission.ADMIN_DELETE,
            Permission.ADMIN_MANAGE_ROLES,
            Permission.ADMIN_MANAGE_PERMISSIONS,
            Permission.SCOLARITE_MANAGE_INSCRIPTIONS,
            Permission.SCOLARITE_MANAGE_NOTES
    )),

    SCOLARITE(Set.of(
            Permission.SCOLARITE_READ,
            Permission.SCOLARITE_CREATE,
            Permission.SCOLARITE_UPDATE,
            Permission.SCOLARITE_DELETE,
            Permission.SCOLARITE_MANAGE_NOTES,
            Permission.SCOLARITE_MANAGE_INSCRIPTIONS
    )),

    ENSEIGNANT(Set.of(
            Permission.ENSEIGNANT_READ,
            Permission.ENSEIGNANT_GRADE_STUDENT,
            Permission.ENSEIGNANT_UPDATE_NOTES,
            Permission.ENSEIGNANT_VIEW_CLASSES
    )),

    ETUDIANT(Set.of(
            Permission.ETUDIANT_READ_PROFILE,
            Permission.ETUDIANT_VIEW_NOTES,
            Permission.ETUDIANT_VIEW_UE
    ));

    private final Set<Permission> permissions;

    ERole(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    /**
     * 🔐 Transformation en GrantedAuthority (clé pour Spring Security + JWT)
     */
    public List<SimpleGrantedAuthority> getAuthorities() {

        List<SimpleGrantedAuthority> authorities = permissions.stream()
                .map(permission ->
                        new SimpleGrantedAuthority(permission.getPermission()))
                .collect(Collectors.toList());

        // Ajout du ROLE_XXX obligatoire pour Spring Security
        authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));

        return authorities;
    }
}

