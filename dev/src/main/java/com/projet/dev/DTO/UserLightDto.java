package com.projet.dev.DTO;

import com.projet.dev.models.User;
import lombok.*;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@Builder
@Getter
@Setter
public class UserLightDto {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String type;

    // Rôles dynamiques
    private Set<String> roles;

    public UserLightDto() {}

    /**
     * Construit un DTO complet à partir de l'entité User.
     * Inclut les rôles et le type.
     */
    public static UserLightDto fromEntity(User user) {
        UserLightDto dto = new UserLightDto();
        dto.id = user.getId();
        dto.nom = user.getNom();
        dto.prenom = user.getPrenom();
        dto.email = user.getEmail();
        dto.type = user.getClass().getSimpleName().toUpperCase();
        dto.roles = user.getRoles() != null
                ? user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet())
                : null;
        dto.password = user.getPassword(); // facultatif : si tu veux renvoyer le hash
        return dto;
    }

    /* ========= getters & setters ========= */
    public Long getId() { return id; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public Set<String> getRoles() { return roles; }

    public void setId(Long id) { this.id = id; }
    public void setNom(String nom) { this.nom = nom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}
