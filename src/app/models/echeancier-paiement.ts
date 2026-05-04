import { EcheanceDetail } from './echeance-detail';
import { NatureTypeFrais } from './type-frais';

export type StatutEcheancier = 'ACTIF' | 'SOLDE' | 'RETARD' | 'ANNULE';

export interface EcheancierPaiement {
  id?: number;

  factureId?: number;
  etudiantId: number;

  typeFraisId: number;
  fraisAcademiqueId?: number;
  parametrageTypeFraisId?: number;
  modeleEcheancierId?: number;

  libelle: string;
  nature: NatureTypeFrais;
  montantTotal: number;

  fractionnable: boolean;
  nombreEcheances: number;
  periodiciteMois: number;

  dateDebut: string;
  dateFin: string;

  statut: StatutEcheancier;
  description?: string;

  echeances?: EcheanceDetail[];

  // legacy / dérivés
  montant?: number;
  dateEcheance?: string;
  paye?: boolean;
}
export { EcheanceDetail };

