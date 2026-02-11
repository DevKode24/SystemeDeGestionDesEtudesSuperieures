import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

  /* ================= AUTH HEADERS ================= */
  private getHeaders() {
    return {
      headers: this.tokenStorage.getAuthHeaders()
    };
  }

  /* ==========================
     CRÉATION
     Enseignant optionnel
  ========================== */
  creer(m: Matiere): Observable<Matiere> {

    const payload = {
      code: m.code,
      intitule: m.intitule,          // ✅ CORRIGÉ
      coefficient: m.coefficient,
      ueId: m.ueId,
      enseignantId: m.enseignantId ?? null
    };

    return this.http
      .post<any>(this.API_URL, payload, this.getHeaders())
      .pipe(map(dto => this.mapToMatiere(dto)));
  }

  /* ==========================
     MODIFICATION
  ========================== */
  modifier(id: number, m: Matiere): Observable<Matiere> {

    const payload = {
      code: m.code,
      intitule: m.intitule,          // ✅ CORRIGÉ
      coefficient: m.coefficient,
      ueId: m.ueId,
      enseignantId: m.enseignantId ?? null
    };

    return this.http
      .put<any>(`${this.API_URL}/${id}`, payload, this.getHeaders())
      .pipe(map(dto => this.mapToMatiere(dto)));
  }

  /* ==========================
     CONSULTATION
  ========================== */
  getAll(): Observable<Matiere[]> {
    return this.http
      .get<any[]>(this.API_URL, this.getHeaders())
      .pipe(map(data => data.map(dto => this.mapToMatiere(dto))));
  }

  getByUE(ueId: number): Observable<Matiere[]> {
    return this.http
      .get<any[]>(`${this.API_URL}/ue/${ueId}`, this.getHeaders())
      .pipe(map(data => data.map(dto => this.mapToMatiere(dto))));
  }

  /* ================= SUPPRESSION ================= */
  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/${id}`,
      this.getHeaders()
    );
  }

  /* ==========================
     🔧 MAPPER BACKEND → FRONT
  ========================== */
  private mapToMatiere(dto: any): Matiere {
    return {
      id: dto.id ?? dto.identifiant,
      code: dto.code,
      intitule: dto.intitule,        // ✅ PLUS DE titre
      coefficient: dto.coefficient,
      ueId: dto.ueId ?? dto.ue?.id,
      enseignantId: dto.enseignantId ?? dto.enseignant?.id ?? null,
      ue: dto.ue ?? null,
      enseignant: dto.enseignant ?? null
    };
  }
}
