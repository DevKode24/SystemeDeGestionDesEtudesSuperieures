import { LigneNote } from './ligne-note';
import { Classe } from './classe';
import { Matiere } from './matiere';
import { Enseignant } from './enseignant';
import { AnneeAcademique } from './annee-academique';

/**
 * Saisie des notes
 * - IDs → utilisés pour POST / PUT
 * - Objets → utilisés pour affichage
 */
export interface SaisieNotes {

  id?: number;

  enseignantId?: number;
  classeId: number;
  matiereId: number;
  anneeAcademiqueId: number;
  semestreId?: number;

  enseignant?: Enseignant;
  classe?: Classe;
  matiere?: Matiere;
  anneeAcademique?: AnneeAcademique;

  lignes: LigneNote[];
}

