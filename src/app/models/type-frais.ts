export type NatureTypeFrais = 'INSCRIPTION' | 'SCOLARITE' | 'ANNEXE' | 'AUTRE';

export interface TypeFrais {
  id?: number;

  nom: string;
  code: string;
  nature: NatureTypeFrais;

  description?: string;

  obligatoire: boolean;
  actif?: boolean;
}
