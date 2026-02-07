import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Classe} from '../models/classe';
import { TokenStorageService } from '../auth/token-storage.service';
import { Filiere } from '../models/filiere';
import { Niveau } from '../models/niveau';
@Injectable({
  providedIn: 'root'
})
export class ClasseService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/classes';
  private readonly FILIERE_URL = 'http://localhost:8085/api/v1/admin/filieres';
  private readonly NIVEAU_URL = 'http://localhost:8085/api/v1/admin/niveaux';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  /* ==========================
     CRUD CLASSE
  ========================== */
  creer(dto: Classe): Observable<Classe> {
    return this.http.post<Classe>(this.API_URL, dto, this.getHeaders());
  }

  modifier(id: number, dto: Classe): Observable<Classe> {
    return this.http.put<Classe>(`${this.API_URL}/${id}`, dto, this.getHeaders());
  }

  getAll(): Observable<Classe[]> {
    return this.http.get<Classe[]>(this.API_URL, this.getHeaders());
  }

  getById(id: number): Observable<Classe> {
    return this.http.get<Classe>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  desactiver(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  /* ==========================
     OPTIONS
  ========================== */
  getFilieres(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(this.FILIERE_URL, this.getHeaders());
  }

  getNiveaux(): Observable<Niveau[]> {
    return this.http.get<Niveau[]>(this.NIVEAU_URL, this.getHeaders());
  }
}
