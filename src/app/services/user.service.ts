import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:8085/api/v1/admin/utilisateurs';

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, this.getHeaders());
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, user, this.getHeaders());
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user, this.getHeaders());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  activerCompte(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/activer`, {}, this.getHeaders());
  }

  desactiverCompte(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/desactiver`, {}, this.getHeaders());
  }

  changerMotDePasse(id: number, nouveauMotDePasse: string): Observable<void> {
    const params = new HttpParams().set('nouveauMotDePasse', nouveauMotDePasse);
    return this.http.post<void>(
      `${this.baseUrl}/${id}/changer-mot-de-passe`,
      null,
      { params, ...this.getHeaders() }
    );
  }
}