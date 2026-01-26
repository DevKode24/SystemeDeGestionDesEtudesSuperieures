import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enseignement } from '../models/enseignement';
import { TokenStorageService } from '../auth/token-storage.service';


@Injectable({
  providedIn: 'root'
})
export class EnseignementService {

  private baseUrl = 'http://localhost:8085/api/v1/admin/enseignements';

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) { }

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  getAll(): Observable<Enseignement[]> {
    return this.http.get<Enseignement[]>(this.baseUrl);
  }

  creer(data: Enseignement): Observable<Enseignement> {
    return this.http.post<Enseignement>(this.baseUrl, data);
  }

  modifier(id: number, data: Enseignement): Observable<Enseignement> {
    return this.http.put<Enseignement>(`${this.baseUrl}/${id}`, data);
  }

  desactiver(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }


}
