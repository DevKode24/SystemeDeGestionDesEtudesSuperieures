import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bulletin } from '../models/bulletin';
import { LigneBulletin } from '../models/ligne-bulletin';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class BulletinService {

  private baseUrl = 'http://localhost:8085/api/v1/admin/bulletins';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  genererBulletin(etudiantId: number, anneeAcademiqueId: number): Observable<Bulletin> {
    return this.http.post<Bulletin>(
      `${this.baseUrl}/generer?etudiantId=${etudiantId}&anneeAcademiqueId=${anneeAcademiqueId}`,
      {},
      this.getHeaders()
    );
  }

  genererBulletinsClasse(classeId: number, anneeAcademiqueId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/generer-classe?classeId=${classeId}&anneeAcademiqueId=${anneeAcademiqueId}`,
      {},
      this.getHeaders()
    );
  }

  getById(id: number): Observable<Bulletin> {
    return this.http.get<Bulletin>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  getByEtudiant(etudiantId: number): Observable<Bulletin[]> {
    return this.http.get<Bulletin[]>(`${this.baseUrl}/etudiant/${etudiantId}`, this.getHeaders());
  }

  getByClasseAndAnnee(classeId: number, anneeId: number): Observable<Bulletin[]> {
    return this.http.get<Bulletin[]>(
      `${this.baseUrl}/classe/${classeId}/annee-academique/${anneeId}`,
      this.getHeaders()
    );
  }

  previsualiserLignes(etudiantId: number, anneeId: number): Observable<LigneBulletin[]> {
    return this.http.get<LigneBulletin[]>(
      `${this.baseUrl}/lignes?etudiantId=${etudiantId}&anneeAcademiqueId=${anneeId}`,
      this.getHeaders()
    );
  }

  verrouiller(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/verrouiller`, {}, this.getHeaders());
  }

  deverrouiller(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/deverrouiller`, {}, this.getHeaders());
  }

  estVerrouille(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}/verrouille`, this.getHeaders());
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}