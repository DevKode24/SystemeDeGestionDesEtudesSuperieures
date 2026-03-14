import { AnneeAcademique } from "./annee-academique";
import { Classe } from "./classe";
import { Enseignant } from "./enseignant";
import { Etudiant } from "./etudiant";
import { Matiere } from "./matiere";
import { Semestre } from "./semestre";
import { Ue } from "./ue";

export interface LigneBulletin {
  id: number;
  bulletinId: number;
  matiereId: number;
  semestreId: number;
  noteFinale: number;
  coefficientMatiere: number;
  moyenneUe: number;
  rangUe: number;
  notePonderee: number;
  credits: number;
  session: string;
  ueId: number;

  enseignant?: Enseignant;
    classe?: Classe;
    matiere?: Matiere;
    anneeAcademique?: AnneeAcademique;
    ue: Ue;
    etudiant?:Etudiant;
    semestre?: Semestre;
  
}

export interface Bulletin {
  id: number;
  etudiantId: number;
  anneeAcademiqueId: number;
  classeId: number;

   enseignant?: Enseignant;
    classe?: Classe;
    matiere?: Matiere;
    anneeAcademique?: AnneeAcademique;
    ue: Ue;
    etudiant?:Etudiant;



  moyennesSemestrielles: { [key: string]: number };

  moyenneAnnuelle: number;
  decision: string;
  mention: string;

  rang: number;
  effectifClasse: number;

  fichierPdfPath: string;

  totalCreditsObtenus: number;
  totalCreditsRequis: number;

  lignesBulletin: LigneBulletin[];

  dateGeneration: string;
  verrouille: boolean;
}