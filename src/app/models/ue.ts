import { Semestre } from './semestre';

export interface Ue {
  id?: number;
  code: string;
  intitule: string;
  credit: number;
  coefficient: number;
  semestre?: Semestre;
  semestreId?: Semestre; // utile pour création / édition
}



