export interface Bulletin {
  id?: number;
  etudiantId: number;
  semestreId: number;
  moyenneGenerale: number;
  mention?: string;
  dateCreation?: Date;
}
