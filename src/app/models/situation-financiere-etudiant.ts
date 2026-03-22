export interface SituationFinanciereEtudiant {
  etudiantId: number;

  totalFacture: number;
  totalPaiement: number;
  totalAjustement: number;

  resteAPayer: number;

  statut: 'SOLDE' | 'PARTIEL' | 'IMPAYE';
}
