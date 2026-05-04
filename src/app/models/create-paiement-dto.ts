export interface CreatePaiementDto {
  etudiantId: number;
  factureId: number;
  montant: number;
  modePaiement: string;
  referenceTransaction: string;
  echeancesSelectionnees: number[];
}