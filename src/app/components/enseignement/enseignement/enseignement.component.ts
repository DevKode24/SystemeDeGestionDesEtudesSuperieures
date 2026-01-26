import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Enseignement } from 'src/app/models/enseignement';
import { Classe } from 'src/app/models/classe';
import { Matiere } from 'src/app/models/matiere';
import { Enseignant } from 'src/app/models/enseignant';

import { EnseignementService } from 'src/app/services/enseignement.service';
import { MatiereService } from 'src/app/services/matiere.service';
import { ClasseService } from 'src/app/services/classe.service';
import { EnseignantService } from 'src/app/services/enseignant.service';
import { TokenStorageService, Role } from 'src/app/auth/token-storage.service';

@Component({
  selector: 'app-enseignement',
  templateUrl: './enseignement.component.html',
  styleUrls: ['./enseignement.component.scss']
})
export class EnseignementComponent implements OnInit {

  form!: FormGroup;

  enseignements: Enseignement[] = [];
  filteredEnseignements: Enseignement[] = [];

  classes: Classe[] = [];
  matieres: Matiere[] = [];
  enseignants: Enseignant[] = [];

  editingId?: number;
  loading = false;

  // filtres
  filterClasse = '';
  filterMatiere = '';
  filterEnseignant = '';

  userRoles: Role | Role[] | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tokenStorage: TokenStorageService,
    private enseignementService: EnseignementService,
    private classeService: ClasseService,
    private matiereService: MatiereService,
    private enseignantService: EnseignantService
  ) {}

  /* =========================
     INIT
     ========================= */
  ngOnInit(): void {
    this.userRoles = this.tokenStorage.getUserRole();

    if (!this.canAccess()) {
      alert('Accès refusé');
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();
    this.loadOptions();
    this.loadEnseignements();
  }

  canAccess(): boolean {
    const allowed = ['ADMIN', 'SCOLARITE'];
    if (!this.userRoles) return false;
    if (Array.isArray(this.userRoles)) {
      return this.userRoles.some(r => allowed.includes(r));
    }
    return allowed.includes(this.userRoles as string);
  }

  initForm(): void {
    this.form = this.fb.group({
      matiereId: [null, Validators.required],
      classeId: [null, Validators.required],
      enseignantId: [null, Validators.required],
      actif: [true]
    });
  }

  /* =========================
     OPTIONS
     ========================= */
  loadOptions(): void {
    this.loadClasses();
    this.loadMatieres();
    this.loadEnseignants();
  }

  loadClasses(): void {
    this.classeService.getAll().subscribe({
      next: res => this.classes = res,
      error: err => console.error('Erreur chargement classes', err)
    });
  }

  loadMatieres(): void {
    this.matiereService.getAll().subscribe({
      next: res => this.matieres = res,
      error: err => console.error('Erreur chargement matières', err)
    });
  }

  loadEnseignants(): void {
    this.enseignantService.getAll().subscribe({
      next: res => this.enseignants = res,
      error: err => console.error('Erreur chargement enseignants', err)
    });
  }

  /* =========================
     ENSEIGNEMENTS
     ========================= */
  loadEnseignements(): void {
    this.enseignementService.getAll().subscribe({
      next: res => {
        this.enseignements = res;
        this.applyFilters();
      },
      error: err => console.error('Erreur chargement enseignements', err)
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const payload: Enseignement = this.form.value;

    const obs = this.editingId
      ? this.enseignementService.modifier(this.editingId, payload)
      : this.enseignementService.creer(payload);

    obs.subscribe({
      next: () => {
        this.loadEnseignements();
        this.resetForm();
      },
      error: err => console.error(err),
      complete: () => this.loading = false
    });
  }

  edit(e: Enseignement): void {
    this.editingId = e.id;
    this.form.patchValue(e);
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  desactiver(id: number): void {
    if (!confirm('Désactiver cet enseignement ?')) return;
    this.enseignementService.desactiver(id).subscribe(() => this.loadEnseignements());
  }

  resetForm(): void {
    this.editingId = undefined;
    this.form.reset({ actif: true });
  }

  applyFilters(): void {
    this.filteredEnseignements = this.enseignements.filter(e =>
      (this.filterClasse === '' || (e.classeCode ?? '').toLowerCase().includes(this.filterClasse.toLowerCase())) &&
      (this.filterMatiere === '' || (e.matiereIntitule ?? '').toLowerCase().includes(this.filterMatiere.toLowerCase())) &&
      (this.filterEnseignant === '' || (e.enseignantNom ?? '').toLowerCase().includes(this.filterEnseignant.toLowerCase()))
    );
  }
}
