import { AnneeAcademique } from "./annee-academique";
import { Classe } from "./classe";
import { Enseignant } from "./enseignant";
import { Etudiant } from "./etudiant";
import { Matiere } from "./matiere";
import { Semestre } from "./semestre";
import { Ue } from "./ue";

export interface LigneBulletin {
    id?: number;
  bulletinId?: number;
  matiereId?: number;
  ueId?: number;
  semestreId?: number;
  noteFinale?: number;
  coefficientMatiere?: number;
  moyenneUe?: number;
  rangUe?: number;
  notePonderee?: number;
  credits?: number;
  session?: any; // Session model manquant
   enseignant?: Enseignant;
      classe?: Classe;
      matiere?: Matiere;
      anneeAcademique?: AnneeAcademique;
      ue: Ue;
      etudiant?:Etudiant;
      semestre?: Semestre;
}
