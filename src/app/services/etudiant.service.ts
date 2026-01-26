import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etudiant } from '../models/etudiant';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({ providedIn: 'root' })
export class EtudiantService {

  private readonly API_URL = 'http://localhost:8085/api/v1/admin/etudiants';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  /**
   * Crée un étudiant en extrayant filière, niveau depuis la classe et année académique depuis l'objet séparé
   */
  creer(etudiant: Etudiant): Observable<Etudiant> {
    const payload: Etudiant = {
      ...etudiant,
      filiere: {
        id: etudiant.classe.filiereId,
        nom: etudiant.classe.filiereNom,
        code: etudiant.classe.filiereNom?.substr(0, 3).toUpperCase() || ''
      },
      niveau: {
        id: etudiant.classe.niveauId,
        libelle: etudiant.classe.niveauLibelle,
        filiereId: etudiant.classe.filiereId,
        code: etudiant.classe.niveauLibelle?.substr(0, 2).toUpperCase() || ''
      },
      // Utilisation de l'objet anneeAcademique déjà défini dans Etudiant
      anneeAcademique: etudiant.anneeAcademique
    };
    return this.http.post<Etudiant>(this.API_URL, payload, this.getHeaders());
  }

  /**
   * Modifie un étudiant en extrayant filière, niveau depuis la classe et année académique depuis l'objet séparé
   */
  modifier(id: number, etudiant: Etudiant): Observable<Etudiant> {
    const payload: Etudiant = {
      ...etudiant,
      filiere: {
        id: etudiant.classe.filiereId,
        nom: etudiant.classe.filiereNom,
        code: etudiant.classe.filiereNom?.substr(0, 3).toUpperCase() || ''
      },
      niveau: {
        id: etudiant.classe.niveauId,
        libelle: etudiant.classe.niveauLibelle,
        filiereId: etudiant.classe.filiereId,
        code: etudiant.classe.niveauLibelle?.substr(0, 2).toUpperCase() || ''
      },
      // Utilisation de l'objet anneeAcademique déjà défini dans Etudiant
      anneeAcademique: etudiant.anneeAcademique
    };
    return this.http.put<Etudiant>(`${this.API_URL}/${id}`, payload, this.getHeaders());
  }

  getAll(): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(this.API_URL, this.getHeaders());
  }

  getById(id: number): Observable<Etudiant> {
    return this.http.get<Etudiant>(`${this.API_URL}/${id}`, this.getHeaders());
  }
}
