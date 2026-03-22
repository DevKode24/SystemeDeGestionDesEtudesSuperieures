import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FraisAcademique } from '../models/frais-academique';
import { TypeFrais } from '../models/type-frais';

import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({ providedIn: 'root' })
export class FraisAcademiqueService {
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/frais-academiques';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  // ✅ Créer un frais académique
  createFrais(frais: FraisAcademique): Observable<FraisAcademique> {
    return this.http.post<FraisAcademique>(this.API_URL, frais, this.getHeaders());
  }

  // ✏️ Mettre à jour un frais
  updateFrais(id: number, frais: FraisAcademique): Observable<FraisAcademique> {
    return this.http.put<FraisAcademique>(`${this.API_URL}/${id}`, frais, this.getHeaders());
  }

  // 🗑️ Supprimer un frais
  deleteFrais(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  // 📄 Frais par ID
  getFraisById(id: number): Observable<FraisAcademique> {
    return this.http.get<FraisAcademique>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  // 📋 Tous les frais
  getAllFrais(): Observable<FraisAcademique[]> {
    return this.http.get<FraisAcademique[]>(this.API_URL, this.getHeaders());
  }

  // 🔍 Frais par filière / niveau / année
  getFraisByFiliereNiveauAnnee(
    filiereId: number,
    niveauId: number,
    anneeId: number
  ): Observable<FraisAcademique[]> {
    return this.http.get<FraisAcademique[]>(
      `${this.API_URL}/filiere/${filiereId}/niveau/${niveauId}/annee/${anneeId}`,
      this.getHeaders()
    );
  }

  // 🔍 Frais par type de frais
  getFraisByTypeFrais(typeFraisId: number): Observable<FraisAcademique[]> {
    return this.http.get<FraisAcademique[]>(
      `${this.API_URL}/type/${typeFraisId}`,
      this.getHeaders()
    );
  }
}
