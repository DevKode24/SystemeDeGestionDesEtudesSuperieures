// ===================== FILIERE =====================
export interface Filiere {
  id: number;
  nom?: string;
  code?: string;
}

// ===================== NIVEAU =====================
export interface Niveau {
  id: number;
  libelle?: string;
  code?: string;
  filiereId?: number;
}

// ===================== CLASSE =====================
export interface Classe {
  id?: number;
  code: string;

  filiereId: number;
  filiereNom?: string;

  niveauId: number;
  niveauLibelle?: string;

  active: boolean;
}

// ===================== ANNEE ACADEMIQUE =====================
export interface AnneeAcademique {
  id: number;
  libelle?: string;
}

// ===================== ETUDIANT =====================
export interface Etudiant {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  matricule: string;
  dateNaissance?: string;
  dateInscription?: string;
  actif?: boolean;
  roles?: string[];
  sexe?: string;
  nationalite?: string;
  etatCivil?: string;
  lieuNaissance?: string;
  contactEtudiant?: string;
  contactUrgence?: string;
  nomTuteur?: string;

  filiere: Filiere;
  niveau: Niveau;
  classe: Classe;
  anneeAcademique?: AnneeAcademique; // choisie via formulaire
}
