package com.projet.dev.DTO;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.util.List;

@Data
@Builder
public class MatiereDto {

    private Long id;
    private String code;
    private String intitule;
    private Double coefficient;
    private UEsDto ue;
    private EnseignantDto enseignant;

    @JsonIgnore
    private List<NoteDto> notes;

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

    public Double getCoefficient() {
        return coefficient;
    }

    public void setCoefficient(Double coefficient) {
        this.coefficient = coefficient;
    }

    public UEsDto getUe() {
        return ue;
    }

    public void setUe(UEsDto ue) {
        this.ue = ue;
    }

    public EnseignantDto getEnseignant() {
        return enseignant;
    }

    public void setEnseignant(EnseignantDto enseignant) {
        this.enseignant = enseignant;
    }

    public List<NoteDto> getNotes() {
        return notes;
    }

    public void setNotes(List<NoteDto> notes) {
        this.notes = notes;
    }

    public MatiereDto(Long id, String code, String intitule, Double coefficient, UEsDto ue, EnseignantDto enseignant, List<NoteDto> notes) {
        this.id = id;
        this.code = code;
        this.intitule = intitule;
        this.coefficient = coefficient;
        this.ue = ue;
        this.enseignant = enseignant;
        this.notes = notes;
    }

    public MatiereDto() {
    }
}
