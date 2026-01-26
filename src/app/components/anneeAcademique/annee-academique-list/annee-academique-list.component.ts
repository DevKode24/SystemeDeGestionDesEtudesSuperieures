import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AnneeAcademique } from 'src/app/models/annee-academique';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';

@Component({
  selector: 'app-annee-academique',
  templateUrl: './annee-academique-list.component.html',
  styleUrls: ['./annee-academique-list.component.scss']
})
export class AnneeAcademiqueComponent implements OnInit {

  annees: AnneeAcademique[] = [];
  filteredAnnees: AnneeAcademique[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  filterLibelle = '';

  constructor(
    private anneeService: AnneeAcademiqueService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      libelle: ['', Validators.required]
    });

    this.loadAnnees();
  }

  /** Chargement des années académiques */
  loadAnnees(): void {
    this.anneeService.getAll().subscribe({
      next: (data) => {
        this.annees = data;
        this.applyFilters();
      },
      error: (err) => {
        console.error(err);
        alert('Impossible de charger les années académiques');
      }
    });
  }

  /** Filtrage */
  applyFilters(): void {
    const libelle = this.filterLibelle.toLowerCase().trim();
    this.filteredAnnees = this.annees.filter(a =>
      !libelle || a.libelle.toLowerCase().includes(libelle)
    );
  }

  /** Création / modification */
  save(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const payload: AnneeAcademique = {
      libelle: this.form.value.libelle
    };

    const request$ = this.editingId
      ? this.anneeService.modifier(this.editingId, payload)
      : this.anneeService.creer(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadAnnees();
        alert('Année académique enregistrée');
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l’enregistrement');
      },
      complete: () => this.loading = false
    });
  }

  /** Préparer la modification */
  edit(annee: AnneeAcademique): void {
    if (!annee.id) return;

    this.editingId = annee.id;
    this.form.patchValue({
      libelle: annee.libelle
    });
  }

  /** Suppression */
  supprimer(id: number): void {
    if (!confirm('Supprimer cette année académique ?')) return;

    this.anneeService.supprimer(id).subscribe({
      next: () => this.loadAnnees(),
      error: () => alert('Erreur lors de la suppression')
    });
  }

  /** Reset formulaire */
  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.loading = false;
  }
}
