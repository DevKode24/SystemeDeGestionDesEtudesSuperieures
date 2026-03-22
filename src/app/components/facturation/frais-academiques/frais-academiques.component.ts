import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FraisAcademique } from 'src/app/models/frais-academique';
import { TypeFrais } from 'src/app/models/type-frais';
import { Filiere } from 'src/app/models/filiere';
import { Niveau } from 'src/app/models/niveau';
import { AnneeAcademique } from 'src/app/models/annee-academique';

import { TypeFraisService } from 'src/app/services/type-frais.service';
import { FiliereService } from 'src/app/services/filiere.service';
import { NiveauService } from 'src/app/services/niveau.service';
import { FraisAcademiqueService } from 'src/app/services/frais-academiques.service';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';

@Component({
  selector: 'app-frais-academiques',
  templateUrl: './frais-academiques.component.html',
  styleUrls: ['./frais-academiques.component.scss']
})
export class FraisAcademiquesComponent implements OnInit {

  // ================= DATA =================
  fraisList: FraisAcademique[] = [];
  filteredFrais: FraisAcademique[] = [];

  typesFrais: TypeFrais[] = [];
  filieres: Filiere[] = [];
  niveaux: Niveau[] = [];
  annees: AnneeAcademique[] = [];

  form!: FormGroup;
  editingId: number | null = null;

  loading = false;

  // ================= FILTER =================
  selectedTypeFrais?: number;
  selectedFiliere?: number;
  selectedNiveau?: number;
  selectedAnnee?: number;

  // ================= PAGINATION =================
  page = 1;
  pageSize = 10;

  constructor(
    private fb: FormBuilder,
    private service: FraisAcademiqueService,
    private typeFraisService: TypeFraisService,
    private filiereService: FiliereService,
    private niveauService: NiveauService,
    private anneeService: AnneeAcademiqueService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAll();
  }

  // ================= INIT =================
  initForm(): void {
    this.form = this.fb.group({
      montant: [null, [Validators.required, Validators.min(0)]],
      typeFraisId: [null, Validators.required],
      filiereId: [null, Validators.required],
      niveauId: [null, Validators.required],
      anneeAcademiqueId: [null, Validators.required],
    });
  }

  // ================= LOAD =================
  loadAll(): void {
    this.loading = true;

    // 🔹 Chargement des frais
    this.service.getAllFrais().subscribe({
      next: (data: FraisAcademique[]) => {
        this.fraisList = data;
        this.applyFilter();
      },
      error: (err) => console.error('Erreur chargement frais', err),
      complete: () => this.loading = false
    });

    // 🔹 Chargement des référentiels (⚠️ adapter aux bons noms de méthodes)
    this.typeFraisService.getAllTypesFrais().subscribe({
      next: (d: TypeFrais[]) => this.typesFrais = d,
      error: (err) => console.error(err)
    });

    this.filiereService.getAll().subscribe({
      next: (d: Filiere[]) => this.filieres = d,
      error: (err) => console.error(err)
    });

    this.niveauService.getAll().subscribe({
      next: (d: Niveau[]) => this.niveaux = d,
      error: (err) => console.error(err)
    });

    this.anneeService.getAll().subscribe({
      next: (d: AnneeAcademique[]) => this.annees = d,
      error: (err) => console.error(err)
    });
  }

  // ================= FILTER =================
  applyFilter(): void {
    this.filteredFrais = this.fraisList.filter((f: FraisAcademique) =>
      (!this.selectedTypeFrais || f.typeFraisId === +this.selectedTypeFrais) &&
      (!this.selectedFiliere || f.filiereId === +this.selectedFiliere) &&
      (!this.selectedNiveau || f.niveauId === +this.selectedNiveau) &&
      (!this.selectedAnnee || f.anneeAcademiqueId === +this.selectedAnnee)
    );

    this.page = 1; // reset pagination
  }

  // ================= PAGINATION =================
  get paginated(): FraisAcademique[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredFrais.slice(start, start + this.pageSize);
  }

  // ================= CRUD =================
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: FraisAcademique = this.form.value;

    const action$ = this.editingId
      ? this.service.updateFrais(this.editingId, payload)
      : this.service.createFrais(payload);

    action$.subscribe({
      next: () => {
        this.resetForm();
        this.loadAll();
      },
      error: (err) => console.error('Erreur sauvegarde', err)
    });
  }

  edit(f: FraisAcademique): void {
    this.editingId = f.id!;
    this.form.patchValue({
      montant: f.montant,
      typeFraisId: f.typeFraisId,
      filiereId: f.filiereId,
      niveauId: f.niveauId,
      anneeAcademiqueId: f.anneeAcademiqueId
    });

    window.scroll({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (!confirm('Supprimer ce frais ?')) return;

    this.service.deleteFrais(id).subscribe({
      next: () => this.loadAll(),
      error: (err) => console.error('Erreur suppression', err)
    });
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
  }
}