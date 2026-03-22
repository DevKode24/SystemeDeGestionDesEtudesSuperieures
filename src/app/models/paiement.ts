import { Facture } from "./facture";
import { RecuPaiement } from "./recu-paiement";
import { Etudiant } from "./etudiant";

export interface Paiement {
  id?: number;

  montant: number;
  datePaiement: string; // LocalDate → string
  modePaiement: string;
  referenceTransaction: string;

  // 🔥 RELATIONS = IDs
  factureId: number;
  recuPaiementId: number;
  etudiantId?: number;

  // 🧠 OBJETS ENRICHIS
  facture?: Facture;
  recuPaiement?: RecuPaiement;
  etudiant?: Etudiant;
}