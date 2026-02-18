
/**
 * Ligne de note d’un étudiant
 * Utilisée pour :
 * - saisie des notes (enseignant)
 * - consultation des résultats (étudiant)
 */
export interface LigneNote {

  /* =========================
     IDENTITÉ
     ========================= */
  etudiantId: number;
  nomPrenom?: string;

  /* =========================
     NOTES BACKEND
     ========================= */

  noteDevoir?: number | null;
  noteSessionOrdinaire?: number | null;
  noteSessionRattrapage?: number | null;

  /* =========================
     CALCULÉ
     ========================= */

  noteFinale?: number | null;
}
