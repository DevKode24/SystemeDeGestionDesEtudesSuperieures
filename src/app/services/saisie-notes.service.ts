import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TokenStorageService } from '../auth/token-storage.service';
import { Classe } from '../models/classe';
import { Matiere } from '../models/matiere';
import { SaisieNotes } from '../models/saisie-notes';
import { AnneeAcademique } from '../models/annee-academique';

@Injectable({
  providedIn: 'root'
})
export class SaisieNotesService {

  private readonly API_BASE = 'http://localhost:8085/api/v1/enseignant';
  private readonly API_ANNEE = 'http://localhost:8085/api/v1/annee-academique';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  /* =========================
     HEADERS
     ========================= */
  private getHeaders(): { headers: HttpHeaders } {
    const token = this.tokenStorage.getAccessToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`
      })
    };
  }

  /* =========================
     CONTEXTE ENSEIGNANT
     ========================= */
  getMesClasses(): Observable<Classe[]> {
    return this.http.get<Classe[]>(
      `${this.API_BASE}/pedagogie/classes`,
      this.getHeaders()
    );
  }

  getMesMatieresParClasse(classeId: number): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(
      `${this.API_BASE}/pedagogie/classes/${classeId}/matieres`,
      this.getHeaders()
    );
  }

  getEtudiantsNoteDtoParClasse(classeId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API_BASE}/pedagogie/classes/${classeId}/etudiants`,
      this.getHeaders()
    );
  }

  /* =========================
     RELEVÉS
     ========================= */
  enregistrerOuMettreAJourReleve(payload: SaisieNotes): Observable<void> {
    return this.http.post<void>(
      `${this.API_BASE}/ReleveNotes/releve`,
      payload,
      this.getHeaders()
    );
  }

  chargerReleve(
    classeId: number,
    matiereId: number,
    anneeAcademiqueId: number
  ): Observable<SaisieNotes | null> {

    const params = new HttpParams()
      .set('classeId', classeId)
      .set('matiereId', matiereId)
      .set('anneeAcademiqueId', anneeAcademiqueId);

    return this.http.get<SaisieNotes | null>(
      `${this.API_BASE}/ReleveNotes/charger`,
      { ...this.getHeaders(), params }
    );
  }

  /* =========================
     ANNÉES ACADÉMIQUES
     ========================= */
  getAllAnneacademique(): Observable<AnneeAcademique[]> {
    return this.http.get<AnneeAcademique[]>(
      this.API_ANNEE,
      this.getHeaders()
    );
  }
}
