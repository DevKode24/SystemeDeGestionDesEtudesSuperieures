import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { Classe } from 'src/app/models/classe';
import { Matiere } from 'src/app/models/matiere';
import { LigneNote } from 'src/app/models/ligne-note';
import { SaisieNotes } from 'src/app/models/saisie-notes';
import { AnneeAcademique } from 'src/app/models/annee-academique';

import { SaisieNotesService } from 'src/app/services/saisie-notes.service';

@Component({
  selector: 'app-saisie-note',
  templateUrl: './saisie-note.component.html',
  styleUrls: ['./saisie-note.component.scss']
})
export class SaisieNoteComponent implements OnInit {

  form!: FormGroup;

  classes: Classe[] = [];
  matieres: Matiere[] = [];
  annees: AnneeAcademique[] = [];

  lignes: LigneNote[] = [];
  loading = false;

  // 🔹 Pagination
  currentPage = 1;
  pageSize = 10;

  constructor(
    private fb: FormBuilder,
    private saisieNotesService: SaisieNotesService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReferentiels();
    this.listenChanges();
  }

  private initForm(): void {
    this.form = this.fb.group({
      classeId: [null, Validators.required],
      matiereId: [null, Validators.required],
      anneeAcademiqueId: [null, Validators.required],
      semestreId: [{ value: null, disabled: true }, Validators.required],
      lignes: this.fb.array([])
    });
  }

  get lignesForm(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  get lignesPage(): LigneNote[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.lignes.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.lignes.length / this.pageSize);
  }

  prevPage(event: Event): void {
    event.preventDefault();
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(event: Event): void {
    event.preventDefault();
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  private loadReferentiels(): void {
    forkJoin({
      classes: this.saisieNotesService.getMesClasses(),
      annees: this.saisieNotesService.getAllAnneacademique()
    }).subscribe(res => {
      this.classes = res.classes;
      this.annees = res.annees;
    });
  }

  private listenChanges(): void {
    // 🔹 Changement classe
    this.form.get('classeId')!.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(classeId => {
        this.resetTable();
        this.matieres = [];
        this.form.patchValue({ matiereId: null, semestreId: null }, { emitEvent: false });

        if (!classeId) return;

        this.saisieNotesService.getMesMatieresParClasse(classeId)
          .subscribe(matieres => {
            this.matieres = matieres;
          });
      });

    // 🔹 Changement matière → auto semestre
    this.form.get('matiereId')!.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(matiereId => {
        if (!matiereId) return;
        const matiere = this.matieres.find(m => m.id === matiereId);
        if (matiere?.semestreId) {
          this.form.get('semestreId')!.patchValue(matiere.semestreId, { emitEvent: false });
        }
      });

    // 🔹 Charger relevé si tout est sélectionné
    this.form.valueChanges
      .pipe(
        distinctUntilChanged((prev, curr) =>
          prev.matiereId === curr.matiereId &&
          prev.semestreId === curr.semestreId &&
          prev.anneeAcademiqueId === curr.anneeAcademiqueId
        )
      )
      .subscribe(() => this.verifierEtCharger());
  }

  private verifierEtCharger(): void {
    const { classeId, matiereId, anneeAcademiqueId, semestreId } = this.form.getRawValue();
    if (!classeId || !matiereId || !anneeAcademiqueId || !semestreId) return;
    this.chargerReleveOuEtudiants(classeId, matiereId, anneeAcademiqueId, semestreId);
  }

  private chargerReleveOuEtudiants(classeId: number, matiereId: number, anneeId: number, semestreId: number): void {
    this.loading = true;
    this.saisieNotesService.chargerReleve(classeId, matiereId, anneeId, semestreId)
      .subscribe({
        next: (releve: SaisieNotes | null) => {
          if (releve && releve.lignes?.length) {
            this.chargerEtudiantsAvecNotes(classeId, releve.lignes);
          } else {
            this.chargerEtudiants(classeId);
          }
          this.loading = false;
        },
        error: () => {
          this.chargerEtudiants(classeId);
          this.loading = false;
        }
      });
  }

  private chargerEtudiants(classeId: number): void {
    this.saisieNotesService.getEtudiantsNoteDtoParClasse(classeId)
      .subscribe(etudiants => {
        this.lignes = etudiants.map(e => ({
          etudiantId: e.id,
          nomPrenom: `${e.nom} ${e.prenom}`,
          noteDevoir: null,
          noteSessionOrdinaire: null,
          noteSessionRattrapage: null,
          noteFinale: null
        }));
        this.currentPage = 1;
        this.construireFormArray();
      });
  }

  private chargerEtudiantsAvecNotes(classeId: number, lignesReleve: LigneNote[]): void {
    this.saisieNotesService.getEtudiantsNoteDtoParClasse(classeId)
      .subscribe(etudiants => {
        this.lignes = etudiants.map(e => {
          const noteExistante = lignesReleve.find(l => l.etudiantId === e.id);
          return {
            etudiantId: e.id,
            nomPrenom: `${e.nom} ${e.prenom}`,
            noteDevoir: noteExistante?.noteDevoir ?? null,
            noteSessionOrdinaire: noteExistante?.noteSessionOrdinaire ?? null,
            noteSessionRattrapage: noteExistante?.noteSessionRattrapage ?? null,
            noteFinale: noteExistante?.noteFinale ?? null
          };
        });
        this.currentPage = 1;
        this.construireFormArray();
      });
  }

  private construireFormArray(): void {
    this.lignesForm.clear();
    this.lignes.forEach(ligne => {
      this.lignesForm.push(this.fb.group({
        noteDevoir: [ligne.noteDevoir, [Validators.min(0), Validators.max(20)]],
        noteSessionOrdinaire: [ligne.noteSessionOrdinaire, [Validators.min(0), Validators.max(20)]],
        noteSessionRattrapage: [ligne.noteSessionRattrapage, [Validators.min(0), Validators.max(20)]]
      }));
    });
  }

  private resetTable(): void {
    this.lignes = [];
    this.lignesForm.clear();
    this.currentPage = 1;
  }

  enregistrer(): void {
    if (this.form.invalid || this.lignes.length === 0) {
      alert('⚠️ Veuillez remplir les notes avant d\'enregistrer');
      return;
    }

    const raw = this.form.getRawValue();
    const payload: SaisieNotes = {
      classeId: raw.classeId,
      matiereId: raw.matiereId,
      anneeAcademiqueId: raw.anneeAcademiqueId,
      semestreId: raw.semestreId,
      lignes: this.lignes.map((l, i) => ({
        etudiantId: l.etudiantId,
        noteDevoir: this.lignesForm.at(i).value.noteDevoir ?? null,
        noteSessionOrdinaire: this.lignesForm.at(i).value.noteSessionOrdinaire ?? null,
        noteSessionRattrapage: this.lignesForm.at(i).value.noteSessionRattrapage ?? null
      }))
    };

    this.saisieNotesService.enregistrerOuMettreAJourReleve(payload)
      .subscribe({
        next: () => {
          alert('✅ Notes enregistrées avec succès !');
          this.verifierEtCharger();
        },
        error: err => {
          alert('❌ Erreur: ' + (err.error?.message || 'Échec enregistrement'));
        }
      });
  }

  imprimer(): void {
    window.print();
  }
}