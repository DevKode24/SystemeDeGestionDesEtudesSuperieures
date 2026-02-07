import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Matiere } from 'src/app/models/matiere';
import { Ue } from 'src/app/models/ue';
import { Enseignant } from 'src/app/models/enseignant';

import { MatiereService } from 'src/app/services/matiere.service';
import { UeService } from 'src/app/services/ue.service';
import { EnseignantService } from 'src/app/services/enseignant.service';

import { Role, TokenStorageService } from 'src/app/auth/token-storage.service';
@Component({
  selector: 'app-matiere',
  templateUrl: './matiere.component.html',
  styleUrls: ['./matiere.component.scss']
})
export class MatiereComponent implements OnInit {

  matieres: Matiere[] = [];
  filteredMatieres: Matiere[] = [];

  ues: Ue[] = [];
  enseignants: Enseignant[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  filterIntitule = '';
  filterUeId: number | null = null;

  role: Role | Role[] | null = null;

  constructor(
    private fb: FormBuilder,
    private matiereService: MatiereService,
    private ueService: UeService,
    private enseignantService: EnseignantService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.role = this.tokenStorage.getUserRole();
    this.initForm();
    this.loadUes();
    this.loadEnseignants();
    this.loadMatieres();
  }

  /* ==========================
     FORM
     ========================== */
  private initForm(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      intitule: ['', Validators.required],
      coefficient: [1, [Validators.required, Validators.min(1)]],
      ueId: [null, Validators.required],
      enseignantId: [null, Validators.required]
    });
  }

  /* ==========================
     LOADERS
     ========================== */
  loadUes(): void {
    this.ueService.getAll().subscribe({
      next: data => this.ues = data,
      error: err => this.handleError(err)
    });
  }

  loadEnseignants(): void {
    this.enseignantService.getAll().subscribe({
      next: data => this.enseignants = data,
      error: err => this.handleError(err)
    });
  }

  loadMatieres(): void {
    const obs$ = this.filterUeId
      ? this.matiereService.getByUE(this.filterUeId)
      : this.matiereService.getAll();

    obs$.subscribe({
      next: data => {
        this.matieres = data;
        this.applyFilters();
      },
      error: err => this.handleError(err)
    });
  }

  /* ==========================
     FILTER
     ========================== */
  applyFilters(): void {
    const term = this.filterIntitule.toLowerCase().trim();

    this.filteredMatieres = this.matieres.filter(m =>
      !term ||
      m.code.toLowerCase().includes(term) ||
      m.intitule.toLowerCase().includes(term)
    );
  }

  /* ==========================
     SAVE
     ========================== */
  save(): void {
  if (this.form.invalid) return;

  this.loading = true;

  const payload: Matiere = {
    code: this.form.value.code,
    intitule: this.form.value.intitule,
    coefficient: this.form.value.coefficient,
    ueId: this.form.value.ueId,                 // ✅ number
    enseignantId: this.form.value.enseignantId  // ✅ number
  };

  const action$ = this.editingId
    ? this.matiereService.modifier(this.editingId, payload)
    : this.matiereService.creer(payload);

  action$.subscribe({
    next: () => {
      this.resetForm();
      this.loadMatieres();
    },
    error: err => this.handleError(err),
    complete: () => this.loading = false
  });
}


  /* ==========================
     EDIT
     ========================== */
  edit(m: Matiere): void {
    if (!m?.id) return;

    this.editingId = m.id;

    this.form.patchValue({
      code: m.code,
      intitule: m.intitule,
      coefficient: m.coefficient,
      ueId: m.ue?.id ?? m.ueId,
      enseignantId: m.enseignant?.id ?? m.enseignantId
    });
  }

  /* ==========================
     DELETE
     ========================== */
  delete(id: number): void {
    if (!confirm('Confirmer la suppression ?')) return;

    this.loading = true;
    this.matiereService.supprimer(id).subscribe({
      next: () => this.loadMatieres(),
      error: err => this.handleError(err),
      complete: () => this.loading = false
    });
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.loading = false;
  }

  private handleError(err: any): void {
    console.error(err);
    alert(err?.status === 403 ? 'Accès refusé' : 'Erreur serveur');
    this.loading = false;
  }

  /* ==========================
     DROITS
  ========================== */
  canEdit(): boolean {
    if (!this.role) return false;
    return Array.isArray(this.role)
      ? this.role.includes(Role.Admin) || this.role.includes(Role.Scolarite)
      : this.role === Role.Admin || this.role === Role.Scolarite;
  }
}
