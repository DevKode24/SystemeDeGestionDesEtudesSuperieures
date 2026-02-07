import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Semestre } from '../models/semestre'; // À adapter selon votre modèle
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({ providedIn: 'root' })
export class SemestreService {
 
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/semestres';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  create(semestre: any): Observable<Semestre> {
    return this.http.post<Semestre>(this.API_URL, semestre, this.getHeaders());
  }

  getAll(): Observable<Semestre[]> {
    return this.http.get<Semestre[]>(this.API_URL, this.getHeaders());
  }

  update(id: number, semestre: any): Observable<Semestre> {
    return this.http.put<Semestre>(`${this.API_URL}/${id}`, semestre, this.getHeaders());
  }

  getById(id: number): Observable<Semestre> {
    return this.http.get<Semestre>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  getByAnneeAcademique(anneeId: number): Observable<Semestre[]> {
    return this.http.get<Semestre[]>(
      `${this.API_URL}/annee/${anneeId}`,
      this.getHeaders()
    );
  }

  calculerMoyenneSemestre(
    etudiantId: number,
    semestreId: number
  ): Observable<number> {
    return this.http.get<number>(
      `${this.API_URL}/${semestreId}/etudiant/${etudiantId}/moyenne`,
      this.getHeaders()
    );
  }
}
