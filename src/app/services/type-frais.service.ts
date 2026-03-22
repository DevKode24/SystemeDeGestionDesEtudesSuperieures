import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TypeFrais } from '../models/type-frais';

import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({ providedIn: 'root' })
export class TypeFraisService {
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/types-frais';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  // ✅ Créer un type de frais
  createTypeFrais(type: TypeFrais): Observable<TypeFrais> {
    return this.http.post<TypeFrais>(this.API_URL, type, this.getHeaders());
  }

  // ✏️ Mettre à jour un type de frais
  updateTypeFrais(id: number, type: TypeFrais): Observable<TypeFrais> {
    return this.http.put<TypeFrais>(`${this.API_URL}/${id}`, type, this.getHeaders());
  }

  // 🗑️ Supprimer un type de frais
  deleteTypeFrais(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  // 📄 Type de frais par ID
  getTypeFraisById(id: number): Observable<TypeFrais> {
    return this.http.get<TypeFrais>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  // 📋 Tous les types de frais
  getAllTypesFrais(): Observable<TypeFrais[]> {
    return this.http.get<TypeFrais[]>(this.API_URL, this.getHeaders());
  }

  // 🔍 Type de frais par nom
  getTypeFraisByNom(nom: string): Observable<TypeFrais> {
    return this.http.get<TypeFrais>(`${this.API_URL}/nom/${nom}`, this.getHeaders());
  }
}
