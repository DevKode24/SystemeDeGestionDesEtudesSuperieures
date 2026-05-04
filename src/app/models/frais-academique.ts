import { AnneeAcademique } from './annee-academique';
import { Filiere } from './filiere';
import { Niveau } from './niveau';
import { TypeFrais } from './type-frais';

export interface FraisAcademique {
  id?: number;

  montant: number;

  typeFraisId: number;
  filiereId: number;
  niveauId: number;
  anneeAcademiqueId: number;

  typeFrais?: TypeFrais;
  typeFraisNom?: string;
  filiere?: Filiere;
  niveau?: Niveau;
  anneeAcademique?: AnneeAcademique;
}
