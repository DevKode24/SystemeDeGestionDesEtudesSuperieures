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
    private anneeService: AnneeAcademiqueService
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
      next: data => this.anneesAcademiques = data,
      error: err => console.error(err)
    });
  }

  loadSemestres(): void {
    this.semestreService.getAll().subscribe({
      next: data => this.semestres = data,
      error: err => console.error(err)
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const payload = {
      numero: this.form.value.numero,
      anneeAcademique: {
        id: this.form.value.anneeAcademiqueId
      }
    };

    const request$ = this.editingId
      ? this.semestreService.update(this.editingId, payload)
      : this.semestreService.create(payload);

    request$.subscribe({
      next: () => {
        this.loadSemestres();
        this.resetForm();
      },
      error: err => {
        console.error(err);
        alert('Erreur lors de l’enregistrement');
      },
      complete: () => this.loading = false
    });
  }

  edit(s: Semestre): void {
    this.editingId = s.id;
    this.form.patchValue({
      numero: s.numero,
      anneeAcademiqueId: s.anneeAcademique?.id
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer ce semestre ?')) return;

    this.semestreService.delete(id).subscribe({
      next: () => this.loadSemestres(),
      error: err => console.error(err)
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset();
  }

  canEdit(): boolean {
    return true; // à sécuriser par rôle plus tard
  }
}