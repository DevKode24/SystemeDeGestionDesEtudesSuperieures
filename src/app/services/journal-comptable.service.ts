import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TokenStorageService } from '../auth/token-storage.service';
import { EcritureComptable } from '../models/ecriture-comptable';

@Injectable({ providedIn: 'root' })
export class JournalComptableService {
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/comptabilite/journal';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  getAllEcritures(): Observable<EcritureComptable[]> {
    return this.http.get<EcritureComptable[]>(this.API_URL, this.getHeaders());
  }

  createEcriture(payload: EcritureComptable): Observable<EcritureComptable> {
    return this.http.post<EcritureComptable>(this.API_URL, payload, this.getHeaders());
  }

  updateEcriture(id: number, payload: EcritureComptable): Observable<EcritureComptable> {
    return this.http.put<EcritureComptable>(`${this.API_URL}/${id}`, payload, this.getHeaders());
  }

  deleteEcriture(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHeaders());
  }
}
