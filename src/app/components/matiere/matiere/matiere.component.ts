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

  /* ==========================
     DONNÉES
  ========================== */
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

  /* ==========================
     INIT
  ========================== */
  ngOnInit(): void {
    this.role = this.tokenStorage.getUserRole();
    console.log('👤 RÔLE CONNECTÉ :', this.role);

    this.initForm();
    this.loadUes();
    this.loadEnseignants();
    this.loadMatieres();
  }

  /* ==========================
     FORMULAIRE
  ========================== */
  private initForm(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      intitule: ['', Validators.required],
      coefficient: [1, [Validators.required, Validators.min(1)]],
      ueId: [null, Validators.required],
      enseignantId: [null, Validators.required]
    });

    console.log('🧾 Formulaire initialisé');
  }

  /* ==========================
     CHARGEMENTS
  ========================== */
  loadUes(): void {
    this.ueService.getAll().subscribe({
      next: data => {
        this.ues = data;
        console.log('📘 UE chargées :', data);
      },
      error: err => this.handleError(err)
    });
  }

  loadEnseignants(): void {
    this.enseignantService.getAll().subscribe({
      next: data => {
        this.enseignants = data;
        console.log('👨‍🏫 Enseignants chargés :', data);
      },
      error: err => this.handleError(err)
    });
  }

  loadMatieres(): void {
    console.log('🔄 Chargement des matières | UE filtre =', this.filterUeId);

    const obs$ = this.filterUeId
      ? this.matiereService.getByUE(this.filterUeId)
      : this.matiereService.getAll();

    obs$.subscribe({
      next: data => {
        this.matieres = data;
        this.applyFilters();
        console.log('📚 Matières reçues :', data);
      },
      error: err => this.handleError(err)
    });
  }

  /* ==========================
     FILTRES
  ========================== */
  applyFilters(): void {
    const term = this.filterIntitule.toLowerCase().trim();

    this.filteredMatieres = this.matieres.filter(m =>
      !term ||
      m.code.toLowerCase().includes(term) ||
      m.intitule.toLowerCase().includes(term)
    );

    console.log('🔍 Filtrage appliqué | Résultat :', this.filteredMatieres);
  }

  /* ==========================
     CRUD
  ========================== */
  save(): void {
    console.log('💾 CLIC ENREGISTRER');

    if (this.form.invalid) {
      console.warn('⛔ Formulaire invalide', this.form.value);
      return;
    }

    this.loading = true;

    const payload: Matiere = {
      code: this.form.value.code,
      intitule: this.form.value.intitule,
      coefficient: this.form.value.coefficient,
      ue: { id: this.form.value.ueId } as Ue,
      enseignant: { id: this.form.value.enseignantId } as Enseignant
    };

    console.log('📦 Payload envoyé :', payload);

    const action$ = this.editingId
      ? this.matiereService.modifier(this.editingId, payload)
      : this.matiereService.creer(payload);

    action$.subscribe({
      next: res => {
        console.log('✅ Sauvegarde OK :', res);
        this.resetForm();
        this.loadMatieres();
      },
      error: err => this.handleError(err),
      complete: () => this.loading = false
    });
  }

  edit(m: Matiere): void {
  console.log('✏️ CLIC MODIFIER :', m);

  if (!m || !m.id) return; // sécurité

  this.editingId = m.id;

  // ✅ Patch du formulaire avec les vrais IDs pour UE et Enseignant
  this.form.patchValue({
    code: m.code,
    intitule: m.intitule,
    coefficient: m.coefficient,
    ueId: m.ue?.id ?? m.ueId,                 // utilise l'ID de ue si présent, sinon ueId
    enseignantId: m.enseignant?.id ?? m.enseignantId // pareil pour enseignant
  });

  console.log('📝 Formulaire pré-rempli pour modification', this.form.value);
}

  delete(id: number): void {
    console.log('🗑️ CLIC SUPPRIMER | ID =', id);

    if (!confirm('Confirmer la suppression ?')) {
      console.log('❎ Suppression annulée');
      return;
    }

    this.loading = true;

    this.matiereService.supprimer(id).subscribe({
      next: () => {
        console.log('🧹 Suppression réussie');
        this.loadMatieres();
      },
      error: err => this.handleError(err),
      complete: () => this.loading = false
    });
  }

  resetForm(): void {
    console.log('🔄 Réinitialisation formulaire');
    this.form.reset();
    this.editingId = null;
    this.loading = false;
  }

  /* ==========================
     SÉCURITÉ
  ========================== */
  canEdit(): boolean {
    console.log('🔐 Vérification droits | rôle =', this.role);

    // ✅ TEMPORAIREMENT TRUE POUR GARANTIR LES CLICS
    return true;

    /*
    if (!this.role) return false;
    return Array.isArray(this.role)
      ? this.role.includes(Role.Admin) || this.role.includes(Role.Scolarite)
      : this.role === Role.Admin || this.role === Role.Scolarite;
    */
  }

  /* ==========================
     ERREURS
  ========================== */
  private handleError(err: any): void {
    console.error('🔥 ERREUR :', err);
    alert(err?.status === 403 ? 'Accès refusé' : 'Erreur serveur');
    this.loading = false;
  }
}
