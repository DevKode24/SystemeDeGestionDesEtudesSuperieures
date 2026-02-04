import { Semestre } from './semestre';

export interface Ue {
  id?: number;
  code: string;
  intitule: string;
  credit: number;
  coefficient: number;

  // pour affichage
  semestre?: Semestre;

  // pour formulaire uniquement
  semestreId?: number;
}



