import { Component, OnInit, signal, computed } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray
} from '@angular/forms';

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

  /* =========================
     FORMULAIRE
     ========================= */
  form!: FormGroup;

  get lignesForm(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  /* =========================
     STATE (Signals)
     ========================= */
  classes = signal<Classe[]>([]);
  matieres = signal<Matiere[]>([]);
  annees = signal<AnneeAcademique[]>([]);
  lignes = signal<LigneNote[]>([]);
  loading = signal(false);

  hasLignes = computed(() => this.lignes().length > 0);

  constructor(
    private fb: FormBuilder,
    private saisieNotesService: SaisieNotesService
  ) {}

  /* =========================
     INIT
     ========================= */
  ngOnInit(): void {

    this.form = this.fb.group({
      classeId: [null, Validators.required],
      matiereId: [null, Validators.required],
      anneeAcademiqueId: [null, Validators.required],
      lignes: this.fb.array([])
    });

    this.chargerClasses();
    this.chargerAnnees();
    this.ecouterChangements();
  }

  /* =========================
     CHARGEMENTS INITIAUX
     ========================= */
  private chargerClasses(): void {
    this.saisieNotesService
      .getMesClasses()
      .subscribe(data => this.classes.set(data));
  }

  private chargerAnnees(): void {
    this.saisieNotesService
      .getAllAnneacademique()
      .subscribe(data => this.annees.set(data));
  }

  /* =========================
     LISTENERS CIBLÉS (SAFE)
     ========================= */
  private ecouterChangements(): void {

    // 🔹 Changement de classe
    this.form.get('classeId')!.valueChanges.subscribe(classeId => {

      this.resetTable();
      this.matieres.set([]);
      this.form.patchValue({ matiereId: null }, { emitEvent: false });

      if (!classeId) return;

      this.saisieNotesService
        .getMesMatieresParClasse(classeId)
        .subscribe(data => this.matieres.set(data));
    });

    // 🔹 Changement matière
    this.form.get('matiereId')!.valueChanges.subscribe(() => {
      this.tenterChargement();
    });

    // 🔹 Changement année académique
    this.form.get('anneeAcademiqueId')!.valueChanges.subscribe(() => {
      this.tenterChargement();
    });
  }

  /* =========================
     DÉCLENCHEUR CENTRAL
     ========================= */
  private tenterChargement(): void {

    const classeId = this.form.get('classeId')!.value;
    const matiereId = this.form.get('matiereId')!.value;
    const anneeId = this.form.get('anneeAcademiqueId')!.value;

    if (!classeId || !matiereId || !anneeId) {
      return;
    }

    this.chargerReleveOuEtudiants(classeId, matiereId, anneeId);
  }

  /* =========================
     LOGIQUE MÉTIER
     ========================= */
  private chargerReleveOuEtudiants(
    classeId: number,
    matiereId: number,
    anneeId: number
  ): void {

    this.loading.set(true);

    this.saisieNotesService
      .chargerReleve(classeId, matiereId, anneeId)
      .subscribe({
        next: (releve: SaisieNotes | null) => {

          if (releve && releve.lignes && releve.lignes.length > 0) {
  this.chargerEtudiantsAvecNotes(classeId, releve.lignes);
}
 else {
            // ✅ Aucun relevé → charger étudiants
            this.chargerEtudiants(classeId);
          }

          this.loading.set(false);
        },
        error: () => {
          // 🔁 En cas d’erreur, on charge quand même les étudiants
          this.chargerEtudiants(classeId);
          this.loading.set(false);
        }
      });
  }
  private chargerEtudiantsAvecNotes(
  classeId: number,
  lignesReleve: LigneNote[]
): void {

  this.saisieNotesService
    .getEtudiantsNoteDtoParClasse(classeId)
    .subscribe(etudiants => {

      const lignes: LigneNote[] = etudiants.map(e => {

        const noteExistante = lignesReleve.find(
          l => l.etudiantId === e.id
        );

        return {
          etudiantId: e.id,
          nomPrenom: `${e.nom} ${e.prenom}`,
          noteCC: noteExistante?.noteCC ?? null,
          noteDST: noteExistante?.noteDST ?? null,
          noteSession: noteExistante?.noteSession ?? null,
          valeur: noteExistante?.valeur ?? null
        };
      });

      this.lignes.set(lignes);
      this.construireFormArray(lignes);
    });
}


  private chargerEtudiants(classeId: number): void {

    this.saisieNotesService
      .getEtudiantsNoteDtoParClasse(classeId)
      .subscribe(etudiants => {

        const lignes: LigneNote[] = etudiants.map(e => ({
          etudiantId: e.id,
          nomPrenom: `${e.nom} ${e.prenom}`,
          noteCC: null,
          noteDST: null,
          noteSession: null,
          valeur: null
        }));

        this.lignes.set(lignes);
        this.construireFormArray(lignes);
      });
  }

  /* =========================
     FORM ARRAY
     ========================= */
  private construireFormArray(lignes: LigneNote[]): void {

    this.lignesForm.clear();

    lignes.forEach(ligne => {
      this.lignesForm.push(
        this.fb.group({
          noteCC: [ligne.noteCC, [Validators.min(0), Validators.max(20)]],
          noteDST: [ligne.noteDST, [Validators.min(0), Validators.max(20)]],
          noteSession: [ligne.noteSession, [Validators.min(0), Validators.max(20)]]
        })
      );
    });
  }

  private resetTable(): void {
    this.lignes.set([]);
    this.lignesForm.clear();
  }

  /* =========================
     ACTIONS
     ========================= */
  enregistrer(): void {

    const payload: SaisieNotes = {
      classeId: this.form.value.classeId,
      matiereId: this.form.value.matiereId,
      anneeAcademiqueId: this.form.value.anneeAcademiqueId,
      lignes: this.lignes().map((l, i) => ({
        etudiantId: l.etudiantId,
        nomPrenom: l.nomPrenom,
        ...this.lignesForm.at(i).value
      }))
    };

    this.saisieNotesService
      .enregistrerOuMettreAJourReleve(payload)
      .subscribe({
        next: () => console.log('✅ Relevé enregistré'),
        error: err => console.error('❌ Erreur enregistrement', err)
      });
  }

  imprimer(): void {
    console.log('🖨️ Impression du relevé');
  }
}
