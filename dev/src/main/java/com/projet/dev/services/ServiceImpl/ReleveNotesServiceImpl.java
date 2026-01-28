package com.projet.dev.services.ServiceImpl;

import com.projet.dev.DTO.ReleveNotesDto;
import com.projet.dev.mapper.ReleveNotesMapper;
import com.projet.dev.models.ReleveNotes;
import com.projet.dev.repository.ReleveNotesRepository;
import com.projet.dev.services.ReleveNotesService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReleveNotesServiceImpl implements ReleveNotesService {

    private final ReleveNotesRepository releveNotesRepository;
    private final ReleveNotesMapper mapper;

    public ReleveNotesServiceImpl(ReleveNotesRepository releveNotesRepository,
                                  ReleveNotesMapper mapper) {
        this.releveNotesRepository = releveNotesRepository;
        this.mapper = mapper;
    }

    @Override
    public ReleveNotesDto creerReleve(ReleveNotesDto dto) {
        ReleveNotes releve = new ReleveNotes();
        // Mapper les champs essentiels depuis le DTO vers l'entité
        releve.setEnseignant(dto.getEnseignantId() != null ? new com.projet.dev.models.Enseignant(dto.getEnseignantId()) : null);
        releve.setClasse(dto.getClasseId() != null ? new com.projet.dev.models.Classe(dto.getClasseId()) : null);
        releve.setMatiere(dto.getMatiereId() != null ? new com.projet.dev.models.Matiere(dto.getMatiereId()) : null);
        releve.setAnneeAcademique(dto.getAnneeAcademiqueId() != null ? new com.projet.dev.models.AnneeAcademique(dto.getAnneeAcademiqueId()) : null);
        releve.setTypeNote(dto.getTypeReleve());
        releve.setStatut(dto.getStatut() != null ? dto.getStatut() : com.projet.dev.models.StatutReleve.EN_ATTENTE);

        ReleveNotes sauvegarde = releveNotesRepository.save(releve);
        return mapper.toDto(sauvegarde);
    }

    @Override
    public ReleveNotesDto obtenirReleveParId(Long id) {
        ReleveNotes releve = releveNotesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Relevé non trouvé avec l'ID: " + id));
        return mapper.toDto(releve);
    }

    @Override
    public List<ReleveNotesDto> listerTousLesReleves() {
        return releveNotesRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReleveNotesDto mettreAJourReleve(Long id, ReleveNotesDto dto) {
        ReleveNotes releve = releveNotesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Relevé non trouvé avec l'ID: " + id));

        if(dto.getTypeReleve() != null) releve.setTypeNote(dto.getTypeReleve());
        if(dto.getStatut() != null) releve.setStatut(dto.getStatut());

        // On peut également mettre à jour les associations si nécessaire
        ReleveNotes misAJour = releveNotesRepository.save(releve);
        return mapper.toDto(misAJour);
    }

    @Override
    public void supprimerReleve(Long id) {
        if(!releveNotesRepository.existsById(id)) {
            throw new RuntimeException("Relevé non trouvé avec l'ID: " + id);
        }
        releveNotesRepository.deleteById(id);
    }
}

