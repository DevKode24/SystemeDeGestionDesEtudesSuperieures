import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Facture } from '../models/facture';
import { Paiement } from '../models/paiement';
import { AjustementFinancier } from '../models/ajustement-financier';
import { TokenStorageService } from '../auth/token-storage.service';
import { SituationFinanciereEtudiant } from '../models/situation-financiere-etudiant';

@Injectable({ providedIn: 'root' })
export class FacturationService {
  // 💡 À adapter avec ton port / env plus tard
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/facturation';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  // 🧾 Générer facture pour étudiant
  genererFacturePourEtudiant(etudiantId: number): Observable<Facture> {
    const params = new HttpParams().set('etudiantId', etudiantId.toString());
    return this.http.post<Facture>(
      `${this.API_URL}/generer-facture`,
      {},
      { params, ...this.getHeaders() }
    );
  }

  // 💰 Enregistrer un paiement
  effectuerPaiement(paiement: Paiement): Observable<Paiement> {
    return this.http.post<Paiement>(
      `${this.API_URL}/paiements`,
      paiement,
      this.getHeaders()
    );
  }

  // 📊 Calculer solde financier étudiant (as tu l’as)
  calculerSoldeEtudiant(etudiantId: number): Observable<{ etudiantId: number; solde: number }> {
    return this.http.get<{ etudiantId: number; solde: number }>(
      `${this.API_URL}/soldes/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  // 📊 Situation financière étudiant
  getSituationFinanciere(etudiantId: number): Observable<SituationFinanciereEtudiant> {
    return this.http.get<SituationFinanciereEtudiant>(
      `${this.API_URL}/situation/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  // 🪙 Appliquer un ajustement financier
  appliquerAjustement(ajustement: AjustementFinancier): Observable<AjustementFinancier> {
    return this.http.post<AjustementFinancier>(
      `${this.API_URL}/ajustements`,
      ajustement,
      this.getHeaders()
    );
  }

  // 📄 Factures d’un étudiant
  getFacturesByEtudiant(etudiantId: number): Observable<Facture[]> {
    return this.http.get<Facture[]>(
      `${this.API_URL}/factures/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  // 💸 Paiements d’un étudiant
  getPaiementsByEtudiant(etudiantId: number): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(
      `${this.API_URL}/paiements/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  // 📊 Statistiques financières (optionnel)
  getStatistiquesEtudiant(
    etudiantId: number
  ): Observable<{
    etudiantId: number;
    totalFacture: number;
    totalPaiement: number;
    totalAjustement: number;
    resteAPayer: number;
    statut: string;
  }> {
    return this.http.get<any>(
      `${this.API_URL}/statistiques/etudiant/${etudiantId}`,
      this.getHeaders()
    );
  }

  // ✅ NOUVEAU : récupérer TOUTES les factures
  getAllFactures(): Observable<Facture[]> {
    return this.http.get<Facture[]>(
      `${this.API_URL}/factures/all`,
      this.getHeaders()
    );
  }
}
