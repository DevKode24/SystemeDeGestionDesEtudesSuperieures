package com.projet.dev.services;

import com.projet.dev.DTO.AdminDto;
import java.util.List;

public interface AdminService {

    AdminDto creerAdmin(AdminDto dto);

    AdminDto modifierAdmin(Long id, AdminDto dto);

    AdminDto getAdminById(Long id);

    AdminDto getAdminByEmail(String email);

    List<AdminDto> listerTousAdmins();

    void activerCompte(Long id);

    void desactiverCompte(Long id);

    void changerMotDePasse(Long id, String nouveauMotDePasse);
}
