import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Classe } from '../models/classe';
import { Matiere } from '../models/matiere';
import { Etudiant } from '../models/etudiant';
import { EtudiantNote } from '../models/etudiant-note';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class EnseignantPedagogiqueService {

  private baseUrl = 'http://localhost:8085/api/v1/enseignant/pedagogie';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  getMesClasses(): Observable<Classe[]> {
    return this.http.get<Classe[]>(`${this.baseUrl}/classes`, this.getHeaders());
  }

  getMesMatieres(classeId: number): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(
      `${this.baseUrl}/classes/${classeId}/matieres`,
      this.getHeaders()
    );
  }

  getEtudiants(classeId: number): Observable<EtudiantNote[]> {
    return this.http.get<EtudiantNote[]>(
      `${this.baseUrl}/classes/${classeId}/etudiants`,
      this.getHeaders()
    );
  }
}
