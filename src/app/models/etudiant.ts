import { AnneeAcademique } from "./annee-academique";
import { Classe } from "./classe";
import { Filiere } from "./filiere";
import { Niveau } from "./niveau";

export interface Etudiant {
  id?: number;

  nom: string;
  prenom: string;
  email: string;
  password?: string;
  type?: string;

  roles?: string[];

  matricule?: string;
  dateNaissance?: string;
  dateInscription?: string;

  sexe?: string;
  nationalite?: string;
  etatCivil?: string;
  lieuNaissance?: string;

  contactEtudiant?: string;
  contactUrgence?: string;
  nomTuteur?: string;

  // 🔥 RELATIONS = IDs
  anneeAcademiqueId: number;
  filiereId: number;
  niveauId: number;
  classeId: number;

  // Objets enrichis
  classe?: Classe;
  filiere?: Filiere;
  niveau?: Niveau;
  anneeAcademique?: AnneeAcademique;
}
