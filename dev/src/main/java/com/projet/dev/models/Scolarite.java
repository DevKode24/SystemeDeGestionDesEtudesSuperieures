package com.projet.dev.models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "scolarites")
@DiscriminatorValue("SCOLARITE")
public class Scolarite extends User {
    public Scolarite() {}
    public Scolarite(String nom, String prenom, String email, String password) {
        super.setNom(nom);
        super.setPrenom(prenom);
        super.setEmail(email);
        super.setPassword(password);
    }
}

