import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { Admin } from '../models/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/admins';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  creer(dto: Admin): Observable<Admin> {
    return this.http.post<Admin>(this.API_URL, dto, this.getHeaders());
  }

  modifier(id: number, dto: Admin): Observable<Admin> {
    return this.http.put<Admin>(`${this.API_URL}/${id}`, dto, this.getHeaders());
  }

  getById(id: number): Observable<Admin> {
    return this.http.get<Admin>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  getByEmail(email: string): Observable<Admin> {
    const params = new HttpParams().set('email', email);
    return this.http.get<Admin>(`${this.API_URL}/email`, { params, ...this.getHeaders() });
  }

  getAll(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.API_URL, this.getHeaders());
  }
}
