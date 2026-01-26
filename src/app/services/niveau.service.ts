import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Niveau } from '../models/niveau';

@Injectable({
  providedIn: 'root'
})
export class NiveauService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/niveaux';

  constructor(private http: HttpClient) {}

  /* ==========================
     CRÉATION
     ========================== */
  creer(niveau: Niveau): Observable<Niveau> {
    return this.http.post<Niveau>(this.API_URL, niveau);
  }

  /* ==========================
     MODIFICATION
     ========================== */
  modifier(id: number, niveau: Niveau): Observable<Niveau> {
    return this.http.put<Niveau>(`${this.API_URL}/${id}`, niveau);
  }

  /* ==========================
     CONSULTATION PAR ID
     ========================== */
  getById(id: number): Observable<Niveau> {
    return this.http.get<Niveau>(`${this.API_URL}/${id}`);
  }

  /* ==========================
     LISTE TOTALE
     ========================== */
  getAll(): Observable<Niveau[]> {
    return this.http.get<Niveau[]>(this.API_URL);
  }

  /* ==========================
     LISTE PAR FILIÈRE
     ========================== */
  getByFiliere(filiereId: number): Observable<Niveau[]> {
    return this.http.get<Niveau[]>(`${this.API_URL}/filiere/${filiereId}`);
  }

  /* ==========================
     RATTACHER À UNE FILIÈRE
     ========================== */
  rattacherAFiliere(niveauId: number, filiereId: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${niveauId}/filiere/${filiereId}`, null);
  }

  /* ==========================
     SUPPRESSION
     ========================== */
  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
