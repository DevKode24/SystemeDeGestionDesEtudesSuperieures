import { AnneeAcademique } from "./annee-academique";
import { Filiere } from "./filiere";
import { Niveau } from "./niveau";
import { TypeFrais } from "./type-frais";

export interface FraisAcademique {
  id?: number;

  montant: number;

  // 🔥 RELATIONS = IDs (pour backend)
  typeFraisId: number;
  filiereId: number;
  niveauId: number;
  anneeAcademiqueId: number;

  // 🧠 OBJETS ENRICHIS (pour affichage frontend)
  typeFrais?: TypeFrais;
  filiere?: Filiere;
  niveau?: Niveau;
  anneeAcademique?: AnneeAcademique;
}