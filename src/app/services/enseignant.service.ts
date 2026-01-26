import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enseignant } from '../models/enseignant';
import { TokenStorageService } from '../auth/token-storage.service';
import { Classe } from '../models/classe';
import { Matiere } from '../models/matiere';
import { SaisieNotes } from '../models/saisie-notes';


@Injectable({
  providedIn: 'root'
})
export class EnseignantService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/enseignants';

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  /* ==========================
     ANCIENNES FONCTIONS
     ========================== */
  creer(dto: Enseignant): Observable<Enseignant> {
    return this.http.post<Enseignant>(this.API_URL, dto, this.getHeaders());
  }

  modifier(id: number, dto: Enseignant): Observable<Enseignant> {
    return this.http.put<Enseignant>(`${this.API_URL}/${id}`, dto, this.getHeaders());
  }

  getAll(): Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(this.API_URL, this.getHeaders());
  }

  getById(id: number): Observable<Enseignant> {
    return this.http.get<Enseignant>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  rechercherParSpecialite(specialite: string): Observable<Enseignant[]> {
    const params = new HttpParams().set('specialite', specialite);
    return this.http.get<Enseignant[]>(`${this.API_URL}/specialite`, { params, ...this.getHeaders() });
  }

  supprimer(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`, this.getHeaders());
  }

  affecterAMatiere(enseignantId: number, matiereId: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${enseignantId}/Matier/${matiereId}`, {}, this.getHeaders());
  }

  /* =========================
     NOUVEAU : GESTION DES NOTES
     ========================= */

  // 1️⃣ Liste des classes où l’enseignant est affecté (via email)
  getClassesAffecteesByEmail(email: string): Observable<Classe[]> {
    return this.http.get<Classe[]>(`${this.API_URL}/classes/email/${email}`, this.getHeaders());
  }

  // 2️⃣ Liste des matières pour une classe donnée et un enseignant (via email)
  getMatieresParClasseByEmail(email: string, classeId: number): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(`${this.API_URL}/classes/${classeId}/matieres/email/${email}`, this.getHeaders());
  }

  

  /* =========================
     ANCIENNES MÉTHODES (optionnel, gardées pour compatibilité)
     ========================= */
  getClassesAffectees(enseignantId: number): Observable<Classe[]> {
    return this.http.get<Classe[]>(`${this.API_URL}/${enseignantId}/classes`, this.getHeaders());
  }

  getMatieresParClasse(enseignantId: number, classeId: number): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(`${this.API_URL}/${enseignantId}/classes/${classeId}/matieres`, this.getHeaders());
  }
}