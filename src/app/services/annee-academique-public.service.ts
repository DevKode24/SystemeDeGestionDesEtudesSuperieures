import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnneeAcademique } from '../models/annee-academique';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AnneeAcademiquePublicService {

  private readonly API_URL = 'http://localhost:8085/api/v1/annee-academique';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  getAll(): Observable<AnneeAcademique[]> {
    return this.http.get<AnneeAcademique[]>(this.API_URL, {
      headers: this.tokenStorage.getAuthHeaders()
    });
  }
}
