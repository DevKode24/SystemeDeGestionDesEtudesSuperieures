import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Filiere } from '../models/filiere';

@Injectable({
  providedIn: 'root'
})
export class FiliereService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/filieres';

  constructor(private http: HttpClient) {}

  /* ==========================
     CRÉATION
     ========================== */
  creer(filiere: Filiere): Observable<Filiere> {
    return this.http.post<Filiere>(this.API_URL, filiere);
  }

  /* ==========================
     MODIFICATION
     ========================== */
  modifier(id: number, filiere: Filiere): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.API_URL}/${id}`, filiere);
  }

  /* ==========================
     CONSULTATION PAR ID
     ========================== */
  getById(id: number): Observable<Filiere> {
    return this.http.get<Filiere>(`${this.API_URL}/${id}`);
  }

  /* ==========================
     RECHERCHE PAR CODE
     ========================== */
  getByCode(code: string): Observable<Filiere> {
    return this.http.get<Filiere>(`${this.API_URL}/code/${code}`);
  }

  /* ==========================
     LISTE TOTALE
     ========================== */
  getAll(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(this.API_URL);
  }

  /* ==========================
     SUPPRESSION
     ========================== */
  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
