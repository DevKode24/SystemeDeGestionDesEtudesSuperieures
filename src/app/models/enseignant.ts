

export interface Enseignant {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  roles: string[];
  specialite: string;
  grade: string;
}

