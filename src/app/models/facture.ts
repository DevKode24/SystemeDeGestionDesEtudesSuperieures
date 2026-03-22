import { Etudiant } from "./etudiant";
import { EcheancierPaiement } from "./echeancier-paiement";

export interface Facture {
  id?: number;

  numeroFacture: string;
  montantTotal: number;
  dateFacture: string;
  statut: 'PAYEE' | 'PARTIELLEMENT_PAYEE' | 'NON_PAYEE';

  etudiantId: number;

  echeancierIds?: number[];
  echeanciers?: EcheancierPaiement[];

  etudiant?: Etudiant;
}
