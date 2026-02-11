import { Filiere } from './filiere';
import { Niveau } from './niveau';
import { Matiere } from './matiere';

export interface Classe {
  id?: number;
  code: string;
  active?: boolean;

  filiere?: Filiere;
  niveau?: Niveau;
  matiere?: Matiere | null;
}
