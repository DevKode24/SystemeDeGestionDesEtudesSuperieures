/**
 * ReleveNotesModel
 * STRICTEMENT aligné avec ReleveNotesDto Backend
 */

import { LigneNote } from './ligne-note';
import { StatutReleve } from './statut-releve';

export interface ReleveNotes {

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

  /* =========================
     LIGNES
  ========================== */

  lignes: LigneNote[];
}