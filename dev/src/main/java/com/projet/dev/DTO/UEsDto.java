package com.projet.dev.DTO;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class UEsDto {

    private Long id;
    private String code;
    private String intitule;
    private Integer credit;
    private Double coefficient;

    private SemestreDto semestre;
    @JsonIgnore
    private List<MatiereDto> matieres;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getIntitule() {
        return intitule;
    }

    public void setIntitule(String intitule) {
        this.intitule = intitule;
    }

    public Integer getCredit() {
        return credit;
    }

    public void setCredit(Integer credit) {
        this.credit = credit;
    }

    public Double getCoefficient() {
        return coefficient;
    }

    public void setCoefficient(Double coefficient) {
        this.coefficient = coefficient;
    }

    public SemestreDto getSemestre() {
        return semestre;
    }

    public void setSemestre(SemestreDto semestre) {
        this.semestre = semestre;
    }

    public List<MatiereDto> getMatieres() {
        return matieres;
    }

    public void setMatieres(List<MatiereDto> matieres) {
        this.matieres = matieres;
    }

}
