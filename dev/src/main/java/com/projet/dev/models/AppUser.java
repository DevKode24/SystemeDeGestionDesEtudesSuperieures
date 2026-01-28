package com.projet.dev.models;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

/**
 * Wrapper User pour Spring Security.
 * Transforme un User (ou ses sous-classes) en UserDetails utilisable par Spring Security.
 */
public class AppUser implements UserDetails {

    private final User user;

    public AppUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User ne peut pas être null");
        }
        this.user = user;
    }

    /**
     * Récupère les rôles de l'utilisateur et les transforme en GrantedAuthority.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (user.getRoles() == null) {
            return java.util.Collections.emptyList();
        }
        return user.getRoles()
                .stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // implémentation simple, peut être étendue
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // implémentation simple, peut être étendue
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // implémentation simple, peut être étendue
    }

    @Override
    public boolean isEnabled() {
        // L’utilisateur est actif et enabled
        return user.isEnabled() && user.isActif();
    }

    // ===== ACCES DIRECT AU USER =====
    public User getUser() {
        return this.user;
    }

    public Long getId() {
        return user.getId();
    }

    public String getNom() {
        return user.getNom();
    }

    public String getPrenom() {
        return user.getPrenom();
    }
}
