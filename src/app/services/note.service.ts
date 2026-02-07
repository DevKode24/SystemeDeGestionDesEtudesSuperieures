import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { Note } from '../models/note';
import { Etudiant } from '../models/etudiant';


@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private baseUrl = 'http://localhost:8085/api/v1/admin/notes';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  creer(data: Note): Observable<Note> {
    return this.http.post<Note>(this.baseUrl, data, this.getHeaders());
  }

  modifier(id: number, noteCC: number, noteExamen: number): Observable<Note> {
    return this.http.put<Note>(
      `${this.baseUrl}/${id}?noteCC=${noteCC}&noteExamen=${noteExamen}`,
      {},
      this.getHeaders()
    );
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  getByEtudiant(etudiantId: number): Observable<Note[]> {
    return this.http.get<Note[]>(
      `${this.baseUrl}/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }
}


