import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Matiere } from '../models/matiere';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class MatiereService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/matieres';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  /* ==========================
     HEADERS AUTH
  ========================== */
  private getHeaders() {
    return {
      headers: this.tokenStorage.getAuthHeaders()
    };
  }

  /* ==========================
     CRÉATION
     Payload EXACT attendu :
     {
       code,
       intitule,
       coefficient,
       ue: { id },
       enseignant: { id }
     }
  ========================== */
  creer(payload: Matiere): Observable<Matiere> {
    return this.http.post<Matiere>(
      this.API_URL,
      payload,
      this.getHeaders()
    );
  }

  /* ==========================
     MODIFICATION
  ========================== */
  modifier(id: number, payload: Matiere): Observable<Matiere> {
    return this.http.put<Matiere>(
      `${this.API_URL}/${id}`,
      payload,
      this.getHeaders()
    );
  }

  /* ==========================
     CONSULTATION
  ========================== */
  getAll(): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(
      this.API_URL,
      this.getHeaders()
    );
  }

  getByUE(ueId: number): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(
      `${this.API_URL}/ue/${ueId}`,
      this.getHeaders()
    );
  }

  /* ==========================
     SUPPRESSION
  ========================== */
  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/${id}`,
      this.getHeaders()
    );
  }
}
