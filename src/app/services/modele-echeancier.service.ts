import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TokenStorageService } from '../auth/token-storage.service';
import { ModeleEcheancier } from '../models/modele-echeancier';

@Injectable({ providedIn: 'root' })
export class ModeleEcheancierService {
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/modeles-echeancier';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  getAllModelesEcheancier(): Observable<ModeleEcheancier[]> {
    return this.http.get<ModeleEcheancier[]>(`${this.API_URL}`, this.getHeaders());
  }

  createModeleEcheancier(payload: ModeleEcheancier): Observable<ModeleEcheancier> {
    return this.http.post<ModeleEcheancier>(`${this.API_URL}`, payload, this.getHeaders());
  }

  updateModeleEcheancier(id: number, payload: ModeleEcheancier): Observable<ModeleEcheancier> {
    return this.http.put<ModeleEcheancier>(`${this.API_URL}/${id}`, payload, this.getHeaders());
  }

  deleteModeleEcheancier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHeaders());
  }
}
