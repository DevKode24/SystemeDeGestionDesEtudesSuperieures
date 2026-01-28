package com.projet.dev.DTO;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemestreDto {

    private Long id;
    private Integer numero;

    private AnneeAcademiqueDto anneeAcademique;

    // Ignoré volontairement pour éviter boucle + PersistentBag
    @JsonIgnore
    private List<UEsDto> ues;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public AnneeAcademiqueDto getAnneeAcademique() {
        return anneeAcademique;
    }

    public void setAnneeAcademique(AnneeAcademiqueDto anneeAcademique) {
        this.anneeAcademique = anneeAcademique;
    }

    public List<UEsDto> getUes() {
        return ues;
    }

    public void setUes(List<UEsDto> ues) {
        this.ues = ues;
    }
}
