export type NatureEcheance = 'INSCRIPTION' | 'TRANCHE_SCOLARITE' | 'ANNEXE';
export type StatutEcheance = 'EN_ATTENTE' | 'PARTIEL' | 'PAYE';

export interface EcheanceDetail {
  id?: number;
  numero: number;
  libelle: string;
  nature: NatureEcheance;
  dateEcheance: string;

  montant: number;
  montantPaye?: number;

  statut: StatutEcheance;
}