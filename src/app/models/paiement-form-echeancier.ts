export interface PaiementFormEcheancier {
  etudiantId: number;
  factureId: number;
  echeancierId: number;
  echeanceIds: number[];
  montant: number;
  modePaiement: string;
}