export interface AjustementFinancier {
  id?: number;

  etudiantId: number;
  type: string;                    // REMISE | MAJORATION | EXONERATION | CREDIT | DEBIT
  montant: number;
  motif: string;
  dateEffet?: string;              // format YYYY-MM-DD
  approuvePar?: string;

  // Champs optionnels si ton API les renvoie
  // createdAt?: string;
  // updatedAt?: string;
}

