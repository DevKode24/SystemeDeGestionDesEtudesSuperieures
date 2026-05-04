import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { Paiement } from '../models/paiement';

@Injectable({ providedIn: 'root' })
export class PaiementService {
  // Correspond à @RequestMapping("/api/v1/admin/paiements")
  private readonly API_URL = 'http://localhost:8085/api/v1/admin/paiements';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  getRecuPdf(paiementId: number) {
  return this.http.get(
    `${this.API_URL}/recus/${paiementId}/pdf`,
    { responseType: 'blob' }
  );
}

  /**
   * Récupérer tous les paiements
   * @Operation(summary = "Recuperer tout les paiements")
   */
  getAllPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(
      `${this.API_URL}`, 
      this.getHeaders()
    );
  }

  /**
   * Récupérer le paiement par id
   * @Operation(summary = "Recuperer le paiement par id")
   */
  getPaiementById(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(
      `${this.API_URL}/${id}`, 
      this.getHeaders()
    );
  }
}