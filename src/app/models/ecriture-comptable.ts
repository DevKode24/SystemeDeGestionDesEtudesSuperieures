export type TypeOperationComptable =
  | 'PAIEMENT'
  | 'REMISE'
  | 'MAJORATION'
  | 'FACTURE'
  | 'ANNULATION'
  | 'CREDIT'
  | 'DEBIT';

export interface EcritureComptable {
  id?: number;
  date: string;
  libelle: string;
  debit: number;
  credit: number;
  compte: string;
  typeOperation: TypeOperationComptable;
  etudiantId?: number;
  factureId?: number;
  reference?: string;
  solde?: number;
}
