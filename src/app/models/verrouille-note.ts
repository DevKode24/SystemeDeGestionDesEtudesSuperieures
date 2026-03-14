/**
 * ReleveNotesModel
 * Aligné strictement avec ReleveNotesDto Backend
 */

import { LigneNote } from './ligne-note';
import { StatutReleve } from './statut-releve';

export interface ReleveNotes {

  /* =========================
     IDENTIFIANT
  ========================== */
  id?: number;

  /* =========================
     CONTEXTE PEDAGOGIQUE
  ========================== */

  enseignantId: number;
  enseignantNom?: string;

  classeId: number;
  classeLibelle?: string;

  matiereId: number;
  matiereLibelle?: string;

  anneeAcademiqueId: number;
  anneeAcademiqueLibelle?: string;

  semestreId: number;

  /* =========================
     TYPE & STATUT
  ========================== */

  typeReleve: 'BROUILLON' | 'OFFICIEL' | 'AUTOMATIQUE';

  statut: StatutReleve;

  /* =========================
     LIGNES
  ========================== */

  lignes: LigneNote[];

  /* =========================
     METADATA
  ========================== */

  dateCreation?: Date;
  dateModification?: Date;

  verrouille?: boolean;
  dateVerrouillage?: Date;
  verrouillePar?: string;
}
