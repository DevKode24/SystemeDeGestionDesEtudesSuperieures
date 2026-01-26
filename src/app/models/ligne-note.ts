
/**
 * Ligne de note d’un étudiant
 * Utilisée pour :
 * - saisie des notes (enseignant)
 * - consultation des résultats (étudiant)
 */
export interface LigneNote {

  /** Identifiant unique de l’étudiant (clé métier) */
  etudiantId: number;

  /** Nom complet de l’étudiant (UI uniquement) */
  nomPrenom?: string;

  /** Note de contrôle continu */
  noteCC?: number | null;

  /** Note de devoir surveillé */
  noteDST?: number | null;

  /** Note de session (examen ou rattrapage) */
  noteSession?: number | null;

  /** Note finale calculée (backend uniquement) */
  valeur?: number | null;
}
