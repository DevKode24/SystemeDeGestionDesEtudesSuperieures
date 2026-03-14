import { LigneNote } from './ligne-note';
import { Classe } from './classe';
import { Matiere } from './matiere';
import { Enseignant } from './enseignant';
import { AnneeAcademique } from './annee-academique';
import { StatutReleve } from './statut-releve';

/**
 * Saisie des notes
 * - IDs → utilisés pour POST / PUT
 * - Objets → utilisés pour affichage
 */
export interface SaisieNotes {

 

  
    /* =========================
       IDENTIFIANT
       (Absent en création, présent en lecture/update)
    ========================== */
    id?: number;
  
    /* =========================
       CONTEXTE PEDAGOGIQUE
    ========================== */
  
    enseignantId: number;
    classeId: number;
    matiereId: number;
    anneeAcademiqueId: number;
    semestreId: number;
  
    /* =========================
       STATUT
    ========================== */
  
    statut: StatutReleve;
  
    /* =========================
       VERROUILLAGE
    ========================== */
  
    verrouille?: boolean;
    dateVerrouillage?: string;   // ISO 8601
    verrouillePar?: string;
  
    /* =========================
       METADATA
    ========================== */
  
    dateCreation?: string;       // ISO 8601
    dateModification?: string;   // ISO 8601
  
   
  enseignant?: Enseignant;
  classe?: Classe;
  matiere?: Matiere;
  anneeAcademique?: AnneeAcademique;

  lignes: LigneNote[];
}

