// src/app/core/models/note.ts
export interface Note {

  id?: number;

  /* =========================
     🎓 IDENTITÉ
     ========================= */

  etudiantId: number;
  matiereId: number;
  anneeAcademiqueId: number;

  /* =========================
     📝 NOTES SAISIES
     ========================= */

  /**
   * Contrôle continu
   */
  noteCC?: number;

  /**
   * Devoir surveillé
   */
  noteDST?: number;

  /**
   * Examen normal
   */
  noteExamen?: number;

  /**
   * Rattrapage
   */
  noteRattrapage?: number;

  /* =========================
     🧮 NOTES CALCULÉES
     ========================= */

  /**
   * Note du devoir
   * = 40% CC + 60% DST
   */
  noteDevoir?: number;

  /**
   * Note de session validée
   * = max(examen, rattrapage)
   */
  noteSession?: number;

  /**
   * Note finale
   * = 35% devoir + 65% session
   */
  noteFinale?: number;

  /* =========================
     📅 MÉTADONNÉES
     ========================= */

  dateSaisie?: Date;
}
