// src/app/core/models/releve-notes.model.ts

import { LigneNote, StatutReleve, TypeReleve } from "./ligne-note";


/**
 * Relevé de notes officiel
 * Généré et piloté par le backend
 */
export interface ReleveNotes {

  /** Identifiant du relevé */
  id: number;

  /** Enseignant */
  enseignantId: number;
  enseignantNom: string;

  /** Classe */
  classeId: number;
  classeLibelle: string;

  /** Matière */
  matiereId: number;
  matiereLibelle: string;

  /** Année académique */
  anneeAcademiqueId: number;
  anneeAcademiqueLibelle: string;

  /** Type de relevé */
  typeReleve: TypeReleve;

  /** Statut du relevé */
  statut: StatutReleve;

  /** Date de création */
  dateCreation: string;

  /** Lignes de notes */
  lignes?: LigneNote[];
}
