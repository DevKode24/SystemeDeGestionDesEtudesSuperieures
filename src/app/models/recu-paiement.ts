import { Paiement } from "./paiement";

export interface RecuPaiement {
  id?: number;

  numeroRecu: string;
  dateGeneration: string; // LocalDate → string
  

  // 🔥 RELATION ID
  paiementId: number;

  // 🧠 OBJET ENRICHI
  paiement?: Paiement;
}