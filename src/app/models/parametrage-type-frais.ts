import { TypeFrais, NatureTypeFrais } from './type-frais';

export interface ParametrageTypeFrais {
  id?: number;
  etablissementId?: number;
  typeFraisId: number;
  libelle: string;
  nature: NatureTypeFrais;
  montantParDefaut?: number;
  fractionnable: boolean;
  nombreTranchesDefaut: number;
  nombreTranchesMax: number;
  periodiciteMois: number;
  paiementInitialObligatoire?: boolean;
  actif?: boolean;
  typeFrais?: TypeFrais;
}
