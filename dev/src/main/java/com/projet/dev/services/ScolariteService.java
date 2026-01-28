package com.projet.dev.services;

import com.projet.dev.DTO.ScolariteDto;
import java.util.List;

public interface ScolariteService {

    ScolariteDto creerScolarite(ScolariteDto dto);

    ScolariteDto modifierScolarite(Long id, ScolariteDto dto);

    ScolariteDto getScolariteById(Long id);

    ScolariteDto getScolariteByEmail(String email);

    List<ScolariteDto> listerToutesScolarites();

    void activerCompte(Long id);

    void desactiverCompte(Long id);

    void changerMotDePasse(Long id, String nouveauMotDePasse);
}
