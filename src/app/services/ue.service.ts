import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ue } from 'src/app/models/ue';


@Injectable({
  providedIn: 'root'
})
export class UeService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/ues';

  constructor(private http: HttpClient) {}

  // 🔹 Créer une UE
  create(ue: Ue): Observable<Ue> {
    return this.http.post<Ue>(this.API_URL, ue);
  }

   getAll(): Observable<Ue[]> {
     return this.http.get<Ue[]>(this.API_URL);
   }


  // 🔹 Supprimer une UE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // 🔹 Modifier une UE
  update(id: number, ue: Ue): Observable<Ue> {
    return this.http.put<Ue>(`${this.API_URL}/${id}`, ue);
  }

  // 🔹 Récupérer une UE par ID
  getById(id: number): Observable<Ue> {
    return this.http.get<Ue>(`${this.API_URL}/${id}`);
  }

  // 🔹 Récupérer les UE d’un semestre
  getBySemestre(semestreId: number): Observable<Ue[]> {
    return this.http.get<Ue[]>(`${this.API_URL}/semestre/${semestreId}`);
  }

  // 🔹 Calculer la moyenne d’une UE pour un étudiant
  calculerMoyenneUE(ueId: number, etudiantId: number): Observable<number> {
    return this.http.get<number>(
      `${this.API_URL}/${ueId}/etudiant/${etudiantId}/moyenne`
    );
  }
}
