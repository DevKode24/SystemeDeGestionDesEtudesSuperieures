import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AnneeAcademique } from '../models/annee-academique';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AnneeAcademiqueService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/Anneeacademique';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  creer(dto: AnneeAcademique): Observable<AnneeAcademique> {
    return this.http.post<AnneeAcademique>(
      this.API_URL,
      dto,
      this.getHeaders()
    );
  }

  modifier(id: number, dto: AnneeAcademique): Observable<AnneeAcademique> {
    return this.http.put<AnneeAcademique>(
      `${this.API_URL}/${id}`,
      dto,
      this.getHeaders()
    );
  }

  getAll(): Observable<AnneeAcademique[]> {
    return this.http.get<AnneeAcademique[]>(
      this.API_URL,
      this.getHeaders()
    );
  }

  getById(id: number): Observable<AnneeAcademique> {
    return this.http.get<AnneeAcademique>(
      `${this.API_URL}/${id}`,
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
