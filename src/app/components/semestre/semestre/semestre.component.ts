import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AnneeAcademique } from 'src/app/models/annee-academique';
import { Semestre } from 'src/app/models/semestre';
import { HttpErrorResponse } from '@angular/common/http';
import { SemestreService } from 'src/app/services/semestre.service';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';

@Component({
  selector: 'app-semestre',
  templateUrl: './semestre.component.html',
  styleUrls: ['./semestre.component.scss']
})
export class SemestreComponent implements OnInit {

  form!: FormGroup;
  semestres: Semestre[] = [];
  anneesAcademiques: AnneeAcademique[] = [];

  editingId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private semestreService: SemestreService,
    private anneeService: AnneeAcademiqueService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAnneesAcademiques();
    this.loadSemestres();
  }

  initForm(): void {
    this.form = this.fb.group({
      numero: [null, Validators.required],
      anneeAcademiqueId: [null, Validators.required]
    });
  }

  loadAnneesAcademiques(): void {
    this.anneeService.getAll().subscribe({
      next: (data: AnneeAcademique[]) => this.anneesAcademiques = data,
      error: (err: HttpErrorResponse) => console.error('Erreur chargement années académiques', err)
    });
  }

  loadSemestres(): void {
    this.semestreService.getAll().subscribe({
      next: (data: Semestre[]) => this.semestres = data,
      error: (err: HttpErrorResponse) => console.error('Erreur chargement semestres', err)
    });
  }

save(): void {
  if (this.form.invalid) return;
  this.loading = true;

  // ✅ DTO attendu par le backend
  const payload = {
    numero: this.form.value.numero,
    anneeAcademique: { id: this.form.value.anneeAcademiqueId } // objet complet
  };

  console.log('contenu de la requete : ', payload);

  const request$ = this.editingId
    ? this.semestreService.update(this.editingId, payload)
    : this.semestreService.create(payload);

  request$.subscribe({
    next: () => {
      this.loadSemestres();
      this.resetForm();
    },
    error: (err: HttpErrorResponse) => {
      console.error('Erreur création / modification semestre', err);
      if (err.status === 403) {
        alert("Vous n'avez pas l'autorisation pour effectuer cette action !");
      }
    },
    complete: () => this.loading = false
  });
}

edit(s: Semestre): void {
  this.editingId = s.id ?? null;
  this.form.patchValue({
    numero: s.numero,
    anneeAcademiqueId: s.anneeAcademique?.id
  });
}

resetForm(): void {
  this.editingId = null;
  this.form.reset();
}



  

  delete(id: number): void {
    if (!confirm('Supprimer ce semestre ?')) return;
    this.semestreService.delete(id).subscribe(() => this.loadSemestres());
  }

  canEdit(): boolean {
    return true;
  }
}
