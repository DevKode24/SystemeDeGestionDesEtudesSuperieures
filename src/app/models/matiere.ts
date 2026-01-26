import { Ue } from './ue';
import { Enseignant } from './enseignant';

export interface Matiere {
  id?: number;
  code: string;
  intitule: string;
  coefficient: number;

  // 🔹 utilisés UNIQUEMENT pour le formulaire
  ueId?: number;
  enseignantId?: number;

  // 🔹 relations complètes pour l'affichage
  ue?: Ue;
  enseignant?: Enseignant;
}
