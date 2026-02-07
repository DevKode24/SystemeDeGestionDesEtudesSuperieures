import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { Ue } from '../models/ue';
@Injectable({ providedIn: 'root' })
export class UeService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/ues';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  /* ==========================
     CRUD
  ========================== */

  creer(payload: Ue): Observable<Ue> {
    return this.http.post<Ue>(
      this.API_URL,
      payload,
      this.getHeaders()
    );
  }

  modifier(id: number, payload: Ue): Observable<Ue> {
    return this.http.put<Ue>(
      `${this.API_URL}/${id}`,
      payload,
      this.getHeaders()
    );
  }

  getAll(): Observable<Ue[]> {
    return this.http.get<Ue[]>(
      this.API_URL,
      this.getHeaders()
    );
  }

  getBySemestre(semestreId: number): Observable<Ue[]> {
    return this.http.get<Ue[]>(
      `${this.API_URL}/semestre/${semestreId}`,
      this.getHeaders()
    );
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/${id}`,
      this.getHeaders()
    );
  }
}