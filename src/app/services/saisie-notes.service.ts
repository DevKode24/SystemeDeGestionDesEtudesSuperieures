import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TokenStorageService } from '../auth/token-storage.service';
import { Classe } from '../models/classe';
import { Matiere } from '../models/matiere';
import { SaisieNotes } from '../models/saisie-notes';
import { AnneeAcademique } from '../models/annee-academique';
import { ReleveNotes } from '../models/relevenote';
import { LigneNote } from '../models/ligne-note';

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

  private getHeaders(): { headers: HttpHeaders } {
    const token = this.tokenStorage.getAccessToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`
      })
    };
  }

  getLignesNotesParReleve(releveId: number) {
  return this.http.get<LigneNote[]>(`${this.API_BASE}/releve/ligne/${releveId}`);
}

  /* ========================= CONTEXTE ENSEIGNANT ========================= */
  getMesClasses(): Observable<Classe[]> {
    return this.http.get<Classe[]>(
      `${this.API_BASE}/pedagogie/classes`,
      this.getHeaders()
    );
  }

 getReleveParContexte(
  enseignantId: number,
  classeId: number,
  matiereId: number,
  anneeAcademiqueId: number,
  semestreId: number
): Observable<SaisieNotes> {

  const params = new HttpParams()
    .set('enseignantId', enseignantId.toString())
    .set('classeId', classeId.toString())
    .set('matiereId', matiereId.toString())
    .set('anneeAcademiqueId', anneeAcademiqueId.toString())
    .set('semestreId', semestreId.toString());

  return this.http.get<SaisieNotes>(
    `${this.API_BASE}/releves/contexte`,
    {
      params,
      headers: this.getHeaders().headers
    }
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

  /* ========================= RELEVÉS ✅ NOUVELLE URL ========================= */
  enregistrerOuMettreAJourReleve(
  payload: ReleveNotes
): Observable<ReleveNotes> {

  return this.http.post<ReleveNotes>(
    `${this.API_BASE}/releve`,
    payload,
    {
      headers: this.getHeaders().headers
    }
  );
}

getEnseignantConnecte(): Observable<any> {
  return this.http.get<any>(
    `${this.API_BASE}/releve/me`,
    this.getHeaders()
  );
}
  chargerReleve(
  classeId: number,
  matiereId: number,
  anneeAcademiqueId: number,
  semestreId: number
): Observable<ReleveNotes | null> {

  const params = new HttpParams()
    .set('classeId', classeId.toString())
    .set('matiereId', matiereId.toString())
    .set('anneeId', anneeAcademiqueId.toString())
    .set('semestreId', semestreId.toString());

  return this.http.get<ReleveNotes | null>(
    `${this.API_BASE}/releve/contexte`,
    { ...this.getHeaders(), params }
  );
}

  getToutesLesNotes() {
  return this.http.get<ReleveNotes[]>(`${this.API_BASE}/releve/toutes`);
}

  /* ========================= ANNÉES ACADÉMIQUES ========================= */
  getAllAnneacademique(): Observable<AnneeAcademique[]> {
    return this.http.get<AnneeAcademique[]>(
      this.API_ANNEE,
      this.getHeaders()
    );
  }

  /**
 * Supprime un relevé de notes
 * @param releveId - ID du relevé à supprimer
 */
supprimerReleve(releveId: number): Observable<void> {
  return this.http.delete<void>(
    `${this.API_BASE}/releve/${releveId}`,
    this.getHeaders()
  );
}

/* =========================
   RELEVÉS DE NOTES - VÉRIFICATION
   ========================= */
/**
 * Vérifie si un relevé existe déjà pour une combinaison spécifique
 * @param classeId - ID de la classe
 * @param matiereId - ID de la matière
 * @param anneeId - ID de l'année académique
 * @param semestreId - ID du semestre
 */
releveExiste(
  classeId: number,
  matiereId: number,
  anneeId: number,
  semestreId: number
): Observable<boolean> {
  const params = new HttpParams()
    .set('classeId', classeId.toString())
    .set('matiereId', matiereId.toString())
    .set('anneeId', anneeId.toString())
    .set('semestreId', semestreId.toString());

  return this.http.get<boolean>(
    `${this.API_BASE}/releve/existe`,
    { ...this.getHeaders(), params }
  );
}


/* =========================
   STATISTIQUES & RAPPORTS
   ========================= */
/**
 * Récupère les statistiques des notes pour une classe et une matière
 * @param classeId - ID de la classe
 * @param matiereId - ID de la matière
 * @param anneeId - ID de l'année académique
 */
obtenirStatistiques(
  classeId: number,
  matiereId: number,
  anneeId: number
): Observable<any> {
  const params = new HttpParams()
    .set('classeId', classeId.toString())
    .set('matiereId', matiereId.toString())
    .set('anneeId', anneeId.toString());

  return this.http.get<any>(
    `${this.API_BASE}/releve/statistiques`,
    { ...this.getHeaders(), params }
  );
}

/**
 * Exporte les notes au format PDF
 * @param classeId - ID de la classe
 * @param matiereId - ID de la matière
 * @param anneeId - ID de l'année académique
 * @param semestreId - ID du semestre
 */
exporterNotesPDF(
  classeId: number,
  matiereId: number,
  anneeId: number,
  semestreId: number
): Observable<Blob> {
  const params = new HttpParams()
    .set('classeId', classeId.toString())
    .set('matiereId', matiereId.toString())
    .set('anneeId', anneeId.toString())
    .set('semestreId', semestreId.toString());

  return this.http.get<Blob>(
    `${this.API_BASE}/releve/export/pdf`,
    { 
      ...this.getHeaders(), 
      params,
      responseType: 'blob' as 'json'
    }
  );
}

/**
 * Exporte les notes au format Excel
 * @param classeId - ID de la classe
 * @param matiereId - ID de la matière
 * @param anneeId - ID de l'année académique
 * @param semestreId - ID du semestre
 */
exporterNotesExcel(
  classeId: number,
  matiereId: number,
  anneeId: number,
  semestreId: number
): Observable<Blob> {
  const params = new HttpParams()
    .set('classeId', classeId.toString())
    .set('matiereId', matiereId.toString())
    .set('anneeId', anneeId.toString())
    .set('semestreId', semestreId.toString());

  return this.http.get<Blob>(
    `${this.API_BASE}/releve/export/excel`,
    { 
      ...this.getHeaders(), 
      params,
      responseType: 'blob' as 'json'
    }
  );
}

/**
 * Exporte les notes au format CSV
 * @param classeId - ID de la classe
 * @param matiereId - ID de la matière
 * @param anneeId - ID de l'année académique
 * @param semestreId - ID du semestre
 */
exporterNotesCSV(
  classeId: number,
  matiereId: number,
  anneeId: number,
  semestreId: number
): Observable<Blob> {
  const params = new HttpParams()
    .set('classeId', classeId.toString())
    .set('matiereId', matiereId.toString())
    .set('anneeId', anneeId.toString())
    .set('semestreId', semestreId.toString());

  return this.http.get<Blob>(
    `${this.API_BASE}/releve/export/csv`,
    { 
      ...this.getHeaders(), 
      params,
      responseType: 'blob' as 'json'
    }
  );
}

/* =========================
   VALIDATION & CORRECTION
   ========================= */
/**
 * Recalcule toutes les notes finales d'un relevé
 * @param releveId - ID du relevé
 */
recalculerNotesFinales(releveId: number): Observable<ReleveNotes> {
  return this.http.put<ReleveNotes>(
    `${this.API_BASE}/releve/${releveId}/recalculer`,
    {},
    this.getHeaders()
  );
}



 getMesReleves(): Observable<ReleveNotes[]> {
    return this.http.get<ReleveNotes[]>(`${this.API_BASE}/toutes`);
  }
/**
 * Valide un relevé de notes (marque comme validé)
 * @param releveId - ID du relevé à valider
 */
validerReleve(releveId: number): Observable<ReleveNotes> {
  return this.http.put<ReleveNotes>(
    `${this.API_BASE}/releve/${releveId}/valider`,
    {},
    this.getHeaders()
  );
}

/**
 * Annule la validation d'un relevé
 * @param releveId - ID du relevé
 */
annulerValidationReleve(releveId: number): Observable<ReleveNotes> {
  return this.http.put<ReleveNotes>(
    `${this.API_BASE}/releve/${releveId}/annuler-validation`,
    {},
    this.getHeaders()
  );
}
}
