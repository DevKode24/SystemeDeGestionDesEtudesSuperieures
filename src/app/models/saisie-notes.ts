import { LigneNote } from './ligne-note';

/**
 * Données envoyées par l’enseignant
 * pour créer ou mettre à jour un relevé
 */
export interface SaisieNotes {

  /** Déduit du token côté backend */
  enseignantId?: number;

  /** Classe concernée */
  classeId: number;

  /** Matière concernée */
  matiereId: number;

  /** Année académique */
  anneeAcademiqueId: number;

  /** Lignes de notes saisies */
  lignes: LigneNote[];
}
