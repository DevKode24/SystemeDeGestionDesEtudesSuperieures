import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { Note } from '../models/note';
import { Etudiant } from '../models/etudiant';


@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private readonly API_URL = 'http://localhost:8085/api/v1/notes';

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {}

  private getHeaders() {
    return { headers: this.tokenStorage.getAuthHeaders() };
  }

  /* ==========================
     1️⃣ Enregistrer une nouvelle note
     ========================== */
  enregistrerNote(note: Note): Observable<Note> {
    return this.http.post<Note>(this.API_URL, note, this.getHeaders());
  }

  /* ==========================
     2️⃣ Modifier une note existante
     ========================== */
  modifierNote(id: number, noteCC: number, noteExamen: number): Observable<Note> {
    const params = new HttpParams()
      .set('noteCC', noteCC.toString())
      .set('noteExamen', noteExamen.toString());
    return this.http.put<Note>(`${this.API_URL}/${id}`, {}, { params, ...this.getHeaders() });
  }

  /* ==========================
     3️⃣ Supprimer une note
     ========================== */
  supprimerNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  /* ==========================
     4️⃣ Récupérer une note par ID
     ========================== */
  getNoteById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.API_URL}/${id}`, this.getHeaders());
  }

  /* ==========================
     5️⃣ Lister les notes d’un étudiant
     ========================== */
  listerNotesParEtudiant(etudiantId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.API_URL}/etudiant/${etudiantId}`, this.getHeaders());
  }

  /* ==========================
     6️⃣ Lister les notes d’une matière
     ========================== */
  listerNotesParMatiere(matiereId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.API_URL}/matiere/${matiereId}`, this.getHeaders());
  }

  /* ==========================
     7️⃣ Lister les notes d’un étudiant pour une année académique
     ========================== */
  listerNotesParEtudiantEtAnnee(etudiantId: number, anneeId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.API_URL}/etudiant/${etudiantId}/annee/${anneeId}`, this.getHeaders());
  }

  /* ==========================
     8️⃣ Calculer la note finale d’une note (CC + Examen)
     ========================== */
  calculerNoteFinale(noteId: number): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/${noteId}/finale`, this.getHeaders());
  }
  listerEtudiantsParClasse(classeId: number): Observable<Etudiant[]> {
  return this.http.get<Etudiant[]>(`http://localhost:8085/api/v1/etudiants/classe/${classeId}`, this.getHeaders());
}
}
