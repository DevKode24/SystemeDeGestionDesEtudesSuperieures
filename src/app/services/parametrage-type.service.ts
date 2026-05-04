import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ParametrageTypeFrais } from '../models/parametrage-type-frais';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({ providedIn: 'root' })
export class ParametrageTypeFraisService {
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/parametrages-type-frais';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  getAllParametragesTypeFrais(): Observable<ParametrageTypeFrais[]> {
    return this.http.get<ParametrageTypeFrais[]>(
      `${this.API_URL}`,
      this.getHeaders()
    );
  }

  createParametrageTypeFrais(payload: ParametrageTypeFrais): Observable<ParametrageTypeFrais> {
    return this.http.post<ParametrageTypeFrais>(
      `${this.API_URL}`,
      payload,
      this.getHeaders()
    );
  }

  updateParametrageTypeFrais(id: number, payload: ParametrageTypeFrais): Observable<ParametrageTypeFrais> {
    return this.http.put<ParametrageTypeFrais>(
      `${this.API_URL}/${id}`,
      payload,
      this.getHeaders()
    );
  }

  deleteParametrageTypeFrais(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/${id}`,
      this.getHeaders()
    );
  }
}
