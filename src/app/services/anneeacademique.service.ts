import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    return this.http.post<AnneeAcademique>(this.API_URL, dto, this.getHeaders());
  }

  getById(id: number): Observable<AnneeAcademique> {
    return this.http.get<AnneeAcademique>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  getAll(): Observable<AnneeAcademique[]> {
    return this.http.get<AnneeAcademique[]>(this.API_URL, this.getHeaders());
  }

  modifier(id: number, dto: AnneeAcademique): Observable<AnneeAcademique> {
    return this.http.put<AnneeAcademique>(`${this.API_URL}/${id}`, dto, this.getHeaders());
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  calculerMoyenne(anneeId: number, etudiantId: number): Observable<number> {
    return this.http.get<number>(
      `${this.API_URL}/${anneeId}/etudiant/${etudiantId}/moyenne`,
      this.getHeaders()
    );
  }

  decisionFinale(moyenne: number): Observable<string> {
    const params = new HttpParams().set('moyenne', moyenne);
    return this.http.get<string>(`${this.API_URL}/decision`, { params, ...this.getHeaders() });
  }
}