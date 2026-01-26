import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Semestre } from '../models/semestre';

@Injectable({
  providedIn: 'root'
})
export class SemestreService {

  private apiUrl = 'http://localhost:8085/api/v1/admin/semestres';

  constructor(private http: HttpClient) {}

  /** Récupérer tous les semestres */
  getAll(): Observable<Semestre[]> {
    return this.http.get<Semestre[]>(this.apiUrl);
  }

  /** Récupérer un semestre par ID */
  getById(id: number): Observable<Semestre> {
    return this.http.get<Semestre>(`${this.apiUrl}/${id}`);
  }

create(semestre: { numero: number; anneeAcademique: { id: number } }): Observable<Semestre> {
  return this.http.post<Semestre>(this.apiUrl, semestre);
}

update(id: number, semestre: { numero: number; anneeAcademique: { id: number } }): Observable<Semestre> {
  return this.http.put<Semestre>(`${this.apiUrl}/${id}`, semestre);
}


  /** Supprimer un semestre */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
