export interface Enseignement {
  id?: number;

  matiereId: number;
  matiereIntitule?: string;

  classeId: number;
  classeCode?: string;

  enseignantId: number;
  enseignantNom?: string;

  anneeAcademiqueId?: number;
  anneeAcademiqueLibelle?: string;

  actif: boolean;
}
