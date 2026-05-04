import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Facture } from '../models/facture';
import { Paiement } from '../models/paiement';
import { AjustementFinancier } from '../models/ajustement-financier';
import { TokenStorageService } from '../auth/token-storage.service';
import { SituationFinanciereEtudiant } from '../models/situation-financiere-etudiant';
import { EcheancierPaiement } from '../models/echeancier-paiement';
import { FactureGenerationResult } from '../models/facture-generation-result';
import { CreatePaiementDto } from '../models/create-paiement-dto';

@Injectable({ providedIn: 'root' })
export class FacturationService {
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/facturation';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  genererFacturePourEtudiant(etudiantId: number, modeleEcheancierId?: number): Observable<FactureGenerationResult> {
    let params = new HttpParams().set('etudiantId', etudiantId.toString());

    if (modeleEcheancierId != null) {
      params = params.set('modeleEcheancierId', modeleEcheancierId.toString());
    }

    return this.http.post<FactureGenerationResult>(
      `${this.API_URL}/generer-facture`,
      {},
      { params, ...this.getHeaders() }
    );
  }

  getFactureById(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.API_URL}/factures/${id}`, this.getHeaders());
  }

effectuerPaiement(paiement: CreatePaiementDto): Observable<Paiement> {
  return this.http.post<Paiement>(`${this.API_URL}/paiements`, paiement, this.getHeaders());
}

  calculerSoldeEtudiant(etudiantId: number): Observable<{ etudiantId: number; solde: number }> {
    return this.http.get<{ etudiantId: number; solde: number }>(
      `${this.API_URL}/soldes/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  getSituationFinanciere(etudiantId: number): Observable<SituationFinanciereEtudiant> {
    return this.http.get<SituationFinanciereEtudiant>(
      `${this.API_URL}/situation/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  appliquerAjustement(ajustement: AjustementFinancier): Observable<AjustementFinancier> {
    return this.http.post<AjustementFinancier>(
      `${this.API_URL}/ajustements`,
      ajustement,
      this.getHeaders()
    );
  }

  getFacturesByEtudiant(etudiantId: number): Observable<Facture[]> {
    return this.http.get<Facture[]>(
      `${this.API_URL}/factures/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  getPaiementsByEtudiant(etudiantId: number): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(
      `${this.API_URL}/paiements/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  getStatistiquesEtudiant(etudiantId: number): Observable<any> {
    return this.http.get<any>(
      `${this.API_URL}/statistiques/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  getAllFactures(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.API_URL}/factures/all`, this.getHeaders());
  }

  getAllEcheanciers(): Observable<EcheancierPaiement[]> {
    return this.http.get<EcheancierPaiement[]>(`${this.API_URL}/echeanciers`, this.getHeaders());
  }

  getEcheanciersByEtudiant(etudiantId: number): Observable<EcheancierPaiement[]> {
    return this.http.get<EcheancierPaiement[]>(
      `${this.API_URL}/echeanciers/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }
getEcheanciersByFacture(factureId: number): Observable<EcheancierPaiement[]> {
  return this.http.get<EcheancierPaiement[]>(
    `${this.API_URL}/echeanciers/facture/${factureId}`,
    this.getHeaders()
  );
}

  createEcheancier(payload: EcheancierPaiement): Observable<EcheancierPaiement> {
    return this.http.post<EcheancierPaiement>(`${this.API_URL}/echeanciers`, payload, this.getHeaders());
  }

  updateEcheancier(id: number, payload: EcheancierPaiement): Observable<EcheancierPaiement> {
    return this.http.put<EcheancierPaiement>(`${this.API_URL}/echeanciers/${id}`, payload, this.getHeaders());
  }

  deleteEcheancier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/echeanciers/${id}`, this.getHeaders());
  }
}
