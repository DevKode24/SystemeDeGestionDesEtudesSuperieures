package com.projet.dev.security.auth;

import com.projet.dev.models.ERole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class RegisterRequest {

    private String username;
    private String nom;
    private String numeroTel;
    private String prenom;
    private String email;
    private String password;
    private ERole role;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getNumeroTel() {
        return numeroTel;
    }

    public void setNumeroTel(String numeroTel) {
        this.numeroTel = numeroTel;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public ERole getRole() {
        return role;
    }

    public void setRole(ERole role) {
        this.role = role;
    }

    public RegisterRequest(String username, String nom, String numeroTel, String prenom, String email, String password, ERole role) {
        this.username = username;
        this.nom = nom;
        this.numeroTel = numeroTel;
        this.prenom = prenom;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}