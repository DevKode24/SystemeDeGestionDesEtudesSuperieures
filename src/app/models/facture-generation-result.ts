import { Facture } from './facture';
import { EcheancierPaiement } from './echeancier-paiement';
import { EcritureComptable } from './ecriture-comptable';

export interface FactureGenerationResult {
  facture: Facture;
  echeanciers: EcheancierPaiement[];
  ecrituresComptables: EcritureComptable[];
  anomalies: string[];
}
