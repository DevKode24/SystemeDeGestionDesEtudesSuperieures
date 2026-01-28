package com.projet.dev.models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

    public Admin() {}

    public Admin(String nom, String prenom, String email, String password) {
        setNom(nom);
        setPrenom(prenom);
        setEmail(email);
        setPassword(password);
    }
}
