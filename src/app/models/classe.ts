export interface Classe {
  id?: number;
  code: string;

  filiereId: number;
  filiereNom?: string;

  niveauId: number;
  niveauLibelle?: string;

  active: boolean;
}
