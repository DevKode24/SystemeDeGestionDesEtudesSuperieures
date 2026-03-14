/**
 * Modèle Angular aligné sur LigneNoteDto (backend Java)
 * Champs exacts : etudiantNom (pas nomPrenom)
 */
export interface LigneNote {
  id?:                    number;
  releveId?:              number;

  // ✅ Étudiant
  etudiantId:             number;
  etudiantNom?:           string;   // ← LigneNoteDto.etudiantNom

  // ✅ Notes
  noteDevoir?:            number | null;
  noteSessionOrdinaire?:  number | null;
  noteSessionRattrapage?: number | null;
  noteFinale?:            number | null;
}