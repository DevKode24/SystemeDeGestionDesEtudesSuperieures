export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  roles: string[];
  // actif?: boolean; // facultatif, pour activer/desactiver
}