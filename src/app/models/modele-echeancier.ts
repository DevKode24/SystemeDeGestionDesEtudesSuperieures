import { EcheanceDetail } from './echeance-detail';
import { NatureTypeFrais } from './type-frais';

export interface ModeleEcheancier {
  id?: number;

  parametrageTypeFraisId?: number;

  libelle: string;
  nature: NatureTypeFrais;

  // montant indicatif pour le template, pas le montant officiel
  montantTheorique?: number;

  fractionnable: boolean;
  nombreEcheances: number;
  periodiciteMois: number;
  dateDebut: string;
  dateFin: string;

  description?: string;
  actif?: boolean;

  echeances?: EcheanceDetail[];
}
