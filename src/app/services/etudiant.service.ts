import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etudiant } from '../models/etudiant';
import { TokenStorageService } from '../auth/token-storage.service';


@Injectable({ providedIn: 'root' })
export class EtudiantService {
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/etudiants';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  creer(etudiant: Etudiant): Observable<Etudiant> {
    return this.http.post<Etudiant>(this.API_URL, etudiant, this.getHeaders());
  }

  modifier(id: number, etudiant: Etudiant): Observable<Etudiant> {
    return this.http.put<Etudiant>(`${this.API_URL}/${id}`, etudiant, this.getHeaders());
  }

  getById(id: number): Observable<Etudiant> {
    return this.http.get<Etudiant>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  getAll(): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(this.API_URL, this.getHeaders());
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHeaders());
  }
  getByClasse(classeId: number): Observable<Etudiant[]> {
  return this.http.get<Etudiant[]>(
    `${this.API_URL}/classe/${classeId}`,
    this.getHeaders()
  );
}

}