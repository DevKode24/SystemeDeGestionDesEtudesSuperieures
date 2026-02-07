import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Filiere } from '../models/filiere';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class FiliereService {

  private baseUrl = 'http://localhost:8085/api/v1/admin/filieres';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  getAll(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(this.baseUrl, this.getHeaders());
  }

  getById(id: number): Observable<Filiere> {
    return this.http.get<Filiere>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  creer(data: Filiere): Observable<Filiere> {
    return this.http.post<Filiere>(this.baseUrl, data, this.getHeaders());
  }

  modifier(id: number, data: Filiere): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.baseUrl}/${id}`, data, this.getHeaders());
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}
