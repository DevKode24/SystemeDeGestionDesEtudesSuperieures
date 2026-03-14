// ================================================================
// 🔥 SERVICE ADMIN RELEVÉS — CORRIGÉ 2026
// BASE_URL : /api/v1/admin/enseignant/releves
// ✅ Token JWT injecté systématiquement
// ✅ Typage TypeScript strict
// ✅ Gestion d'erreur robuste sur chaque méthode
// ================================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';

// ─── MODÈLES ────────────────────────────────────────────────────

export interface LigneNoteDto {
  id?: number;
  releveId?: number;
  etudiantId: number;
  etudiantNom?: string;
  noteDevoir?: number | null;
  noteSessionOrdinaire?: number | null;
  noteSessionRattrapage?: number | null;
  noteFinale?: number | null;
}

export type StatutReleve = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export interface ReleveNotesDto {
  id?: number;
  enseignantId: number;
  classeId: number;
  matiereId: number;
  anneeAcademiqueId: number;
  semestreId: number;
  enseignantNom?: string;
  classeNom?: string;
  matiereNom?: string;
  statut: StatutReleve;
  verrouille: boolean;
  dateVerrouillage?: string;
  verrouillePar?: string;
  dateCreation?: string;
  dateModification?: string;
  lignes: LigneNoteDto[];
}

export interface ClasseReleveGroupDto {
  classeId: number;
  classeNom: string;
  toutVerrouille: boolean;
  nombreReleves: number;
  nombreVerrouilles: number;
  releves: ReleveNotesDto[];
}

export interface ClasseDto {
  id: number;
  nom?: string;
  code?: string;
  filiere?: any;
  niveau?: any;
  anneeAcademiqueId?: number;
}

export interface MatiereDto {
  id: number;
  nom?: string;
  intitule?: string;
  code?: string;
  coefficient?: number;
}

export interface AnneeAcademiqueDto {
  id: number;
  libelle?: string;
  annee?: string;
}

export interface SemestreDto {
  id: number;
  numero?: number;
  libelle?: string;
  anneeAcademiqueId?: number;
}

export interface FiltreReleve {
  statut?: StatutReleve | null;
  verrouille?: boolean | null;
  classeId?: number | null;
  matiereId?: number | null;
  anneeId?: number | null;
  enseignantId?: number | null;
  semestreId?: number | null;
}

// ─── SERVICE ────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ReleveNotesAdminService {

  // ── URLs (respecte les routes existantes du backend) ─────────
  private readonly BASE_URL         = 'http://localhost:8085/api/v1/admin/enseignant/releves';
  private readonly CLASSE_URL       = 'http://localhost:8085/api/v1/admin/classes';
  private readonly MATIERE_URL      = 'http://localhost:8085/api/v1/admin/matieres';
  private readonly ANNEE_URL        = 'http://localhost:8085/api/v1/admin/Anneeacademique';
  private readonly SEMESTRE_URL     = 'http://localhost:8085/api/v1/admin/semestres';
  private readonly ENSEIGNEMENT_URL = 'http://localhost:8085/api/v1/admin/enseignements';
  private readonly LIGNES_URL       = 'http://localhost:8085/api/v1/enseignant/releve/ligne';

  constructor(
    private http:         HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  // ── Authentification ─────────────────────────────────────────
  /**
   * ✅ CORRECTION : récupération du token à chaque appel (évite le token périmé en mémoire)
   */
  private headers(json = true): { headers: HttpHeaders } {
    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      console.warn('[ReleveNotesAdminService] Aucun token JWT trouvé — requête potentiellement rejetée');
    }
    const h: Record<string, string> = {
      Authorization: `Bearer ${token ?? ''}`
    };
    if (json) {
      h['Content-Type'] = 'application/json';
    }
    return { headers: new HttpHeaders(h) };
  }

  // =============================================================
  // 📚 RÉFÉRENTIELS
  // =============================================================

  getAllClasses(): Observable<ClasseDto[]> {
    return this.http.get<ClasseDto[]>(this.CLASSE_URL, this.headers())
      .pipe(
        catchError(err => {
          console.error('Erreur chargement classes:', err);
          return of([]);
        })
      );
  }

  getAllMatieres(): Observable<MatiereDto[]> {
    return this.http.get<MatiereDto[]>(this.MATIERE_URL, this.headers())
      .pipe(
        catchError(err => {
          console.error('Erreur chargement matières:', err);
          return of([]);
        })
      );
  }

  /** ⚠️ URL existante : /admin/Anneeacademique (A majuscule conservée) */
  getAllAnnees(): Observable<AnneeAcademiqueDto[]> {
    return this.http.get<AnneeAcademiqueDto[]>(this.ANNEE_URL, this.headers())
      .pipe(
        catchError(err => {
          console.error('Erreur chargement années:', err);
          return of([]);
        })
      );
  }

  getAllSemestres(): Observable<SemestreDto[]> {
    return this.http.get<SemestreDto[]>(this.SEMESTRE_URL, this.headers())
      .pipe(
        catchError(err => {
          console.error('Erreur chargement semestres:', err);
          return of([]);
        })
      );
  }

  /** Matières d'une classe via Enseignement */
  getMatieresParClasse(classeId: number): Observable<MatiereDto[]> {
    return this.http.get<any[]>(
      `${this.ENSEIGNEMENT_URL}/classe/${classeId}`,
      this.headers()
    ).pipe(
      map((ens: any[]) => {
        const seen   = new Set<number>();
        const result: MatiereDto[] = [];
        for (const e of ens) {
          const raw = e.matiere ?? e.matiereDto ?? null;
          if (raw?.id && !seen.has(raw.id)) {
            seen.add(raw.id);
            result.push({
              id:          raw.id,
              code:        raw.code        ?? '',
              intitule:    raw.intitule    ?? raw.nom ?? `Matière ${raw.id}`,
              nom:         raw.intitule    ?? raw.nom ?? `Matière ${raw.id}`,
              coefficient: raw.coefficient ?? 1
            });
          }
        }
        return result;
      }),
      catchError(err => {
        console.error('Erreur chargement matières par classe:', err);
        return of([]);
      })
    );
  }

  // =============================================================
  // 📋 RELEVÉS — LECTURE
  // =============================================================

  /** Tous les relevés (liste plate) */
  getAll(): Observable<ReleveNotesDto[]> {
    return this.http.get<ReleveNotesDto[]>(this.BASE_URL, this.headers())
      .pipe(
        map(releves => releves.map(r => this.normaliserReleve(r))),
        catchError(err => {
          console.error('Erreur getAll relevés:', err);
          return of([]);
        })
      );
  }

  /** Relevé par ID (avec lignes complètes) */
  getById(id: number): Observable<ReleveNotesDto> {
    return this.http.get<ReleveNotesDto>(`${this.BASE_URL}/${id}`, this.headers())
      .pipe(
        map(r => this.normaliserReleve(r)),
        catchError(err => {
          console.error(`Erreur getById(${id}):`, err);
          return throwError(() => err);
        })
      );
  }

  /** Filtrage admin */
  filtrer(filtres: FiltreReleve): Observable<ReleveNotesDto[]> {
    let params = new HttpParams();
    if (filtres.statut      != null) params = params.set('statut',       filtres.statut);
    if (filtres.verrouille  != null) params = params.set('verrouille',   String(filtres.verrouille));
    if (filtres.classeId    != null) params = params.set('classeId',     String(filtres.classeId));
    if (filtres.matiereId   != null) params = params.set('matiereId',    String(filtres.matiereId));
    if (filtres.anneeId     != null) params = params.set('anneeId',      String(filtres.anneeId));
    if (filtres.enseignantId != null) params = params.set('enseignantId', String(filtres.enseignantId));

    return this.http.get<ReleveNotesDto[]>(
      `${this.BASE_URL}/filtrer`,
      { ...this.headers(), params }
    ).pipe(
      map(releves => releves.map(r => this.normaliserReleve(r))),
      catchError(err => {
        console.error('Erreur filtrer relevés:', err);
        return of([]);
      })
    );
  }

  /**
   * ✅ CORRECTION : Relevés groupés par classe
   * Gestion des erreurs 401/500 avec fallback sur getAll()
   */
  getGroupes(anneeId?: number | null, semestreId?: number | null): Observable<ClasseReleveGroupDto[]> {
    let params = new HttpParams();
    if (anneeId)    params = params.set('anneeId',    String(anneeId));
    if (semestreId) params = params.set('semestreId', String(semestreId));

    return this.http.get<ClasseReleveGroupDto[]>(
      `${this.BASE_URL}/groupes`,
      { ...this.headers(), params }
    ).pipe(
      map(groupes => groupes.map(g => ({
        ...g,
        releves: g.releves.map(r => this.normaliserReleve(r))
      }))),
      catchError(err => {
        console.error('Erreur getGroupes:', err.status, err.message);
        // ✅ Fallback : construire les groupes côté client depuis getAll()
        if (err.status === 401) {
          console.warn('Token expiré ou insuffisant pour /groupes');
          return of([]);
        }
        // Pour 404 ou 500, essayer de construire les groupes depuis la liste plate
        return this.getAll().pipe(
          map(releves => this.construireGroupesDepuisReleves(releves, anneeId, semestreId)),
          catchError(() => of([]))
        );
      })
    );
  }

  /** Lignes de notes d'un relevé */
  getLignesParReleve(releveId: number): Observable<LigneNoteDto[]> {
    return this.http.get<LigneNoteDto[]>(
      `${this.LIGNES_URL}/${releveId}`,
      this.headers()
    ).pipe(
      catchError(err => {
        console.error(`Erreur getLignes(${releveId}):`, err);
        return of([]);
      })
    );
  }

  // =============================================================
  // 🔒 VERROUILLAGE
  // =============================================================

  verrouiller(id: number): Observable<ReleveNotesDto> {
    return this.http.put<ReleveNotesDto>(
      `${this.BASE_URL}/${id}/verrouiller`, {}, this.headers()
    ).pipe(
      map(r => this.normaliserReleve(r)),
      catchError(err => throwError(() => err))
    );
  }

  deverrouiller(id: number): Observable<ReleveNotesDto> {
    return this.http.put<ReleveNotesDto>(
      `${this.BASE_URL}/${id}/deverrouiller`, {}, this.headers()
    ).pipe(
      map(r => this.normaliserReleve(r)),
      catchError(err => throwError(() => err))
    );
  }

  verrouillerClasse(classeId: number, anneeId: number, semestreId: number): Observable<ReleveNotesDto[]> {
    const params = new HttpParams()
      .set('classeId',   String(classeId))
      .set('anneeId',    String(anneeId))
      .set('semestreId', String(semestreId));
    return this.http.put<ReleveNotesDto[]>(
      `${this.BASE_URL}/verrouiller-classe`, {}, { ...this.headers(), params }
    ).pipe(
      map(releves => releves.map(r => this.normaliserReleve(r))),
      catchError(err => throwError(() => err))
    );
  }

  deverrouillerClasse(classeId: number, anneeId: number, semestreId: number): Observable<ReleveNotesDto[]> {
    const params = new HttpParams()
      .set('classeId',   String(classeId))
      .set('anneeId',    String(anneeId))
      .set('semestreId', String(semestreId));
    return this.http.put<ReleveNotesDto[]>(
      `${this.BASE_URL}/deverrouiller-classe`, {}, { ...this.headers(), params }
    ).pipe(
      map(releves => releves.map(r => this.normaliserReleve(r))),
      catchError(err => throwError(() => err))
    );
  }

  // =============================================================
  // ✅ VALIDATION
  // =============================================================

  valider(id: number): Observable<ReleveNotesDto> {
    return this.http.put<ReleveNotesDto>(
      `${this.BASE_URL}/${id}/valider`, {}, this.headers()
    ).pipe(
      map(r => this.normaliserReleve(r)),
      catchError(err => throwError(() => err))
    );
  }

  rejeter(id: number): Observable<ReleveNotesDto> {
    return this.http.put<ReleveNotesDto>(
      `${this.BASE_URL}/${id}/rejeter`, {}, this.headers()
    ).pipe(
      map(r => this.normaliserReleve(r)),
      catchError(err => throwError(() => err))
    );
  }

  // =============================================================
  // 📤 IMPORT
  // =============================================================

  importer(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(
      `${this.BASE_URL}/import`, fd, this.headers(false)
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // =============================================================
  // 🔧 UTILITAIRES PRIVÉS
  // =============================================================

  /**
   * Normalise un relevé reçu du backend :
   * - garantit que lignes est toujours un tableau
   * - garantit que statut est défini
   * - garantit que verrouille est un booléen
   */
  private normaliserReleve(r: any): ReleveNotesDto {
    return {
      ...r,
      lignes:     Array.isArray(r.lignes) ? r.lignes : [],
      statut:     r.statut ?? 'EN_ATTENTE',
      verrouille: r.verrouille === true
    };
  }

  /**
   * Construit les groupes par classe côté client (fallback si /groupes échoue)
   */
  construireGroupesDepuisReleves(
    releves: ReleveNotesDto[],
    anneeId?: number | null,
    semestreId?: number | null
  ): ClasseReleveGroupDto[] {
    // Filtrer si nécessaire
    let filtrés = releves;
    if (anneeId)    filtrés = filtrés.filter(r => r.anneeAcademiqueId === anneeId);
    if (semestreId) filtrés = filtrés.filter(r => r.semestreId === semestreId);

    // Grouper par classeId
    const map = new Map<number, ReleveNotesDto[]>();
    filtrés.forEach(r => {
      if (!map.has(r.classeId)) map.set(r.classeId, []);
      map.get(r.classeId)!.push(r);
    });

    const groupes: ClasseReleveGroupDto[] = [];
    map.forEach((relevesClasse, classeId) => {
      const nbVerrouilles = relevesClasse.filter(r => r.verrouille).length;
      groupes.push({
        classeId,
        classeNom:        relevesClasse[0]?.classeNom ?? `Classe #${classeId}`,
        toutVerrouille:   nbVerrouilles === relevesClasse.length && relevesClasse.length > 0,
        nombreReleves:    relevesClasse.length,
        nombreVerrouilles: nbVerrouilles,
        releves:          relevesClasse
      });
    });

    return groupes.sort((a, b) => a.classeNom.localeCompare(b.classeNom));
  }
}