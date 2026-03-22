import { Etudiant } from "./etudiant";

export interface JournalComptable {
  id?: number;

  dateOperation: string; // LocalDate → string
  typeOperation: string;
  montant: number;
  description: string;

  // 🔥 RELATION ID
  etudiantId: number;

  // 🧠 OBJET ENRICHI
  etudiant?: Etudiant;
}