import { Ue } from './ue';
import { Enseignant } from './enseignant';

export interface Matiere {
  id?: number;              // identifiant
  code: string;
  intitule: string;            // ✅ ALIGNÉ BACKEND
  coefficient: number;

  // utilisés pour la saisie
  ueId?: number;
  enseignantId?: number | null;  // ✅ optionnel

  // relations pour affichage
  ue?: Ue;
  enseignant?: Enseignant | null;
}


