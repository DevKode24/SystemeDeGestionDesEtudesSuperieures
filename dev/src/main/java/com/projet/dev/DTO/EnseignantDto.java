package com.projet.dev.DTO;

import com.projet.dev.models.Matiere;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class EnseignantDto extends UserLightDto {

    private String specialite;
    private String grade;
    private String password;

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }
    
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // On surcharge les rôles pour renvoyer des String
    private Set<String> roles;

    @Override
    public Set<String> getRoles() {
        return roles;
    }

    @Override
    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
