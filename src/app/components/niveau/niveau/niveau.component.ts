import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TokenStorageService, Role } from 'src/app/auth/token-storage.service';
import { Niveau } from 'src/app/models/niveau';
import { NiveauService } from 'src/app/services/niveau.service';
import { Filiere } from 'src/app/models/filiere';
import { FiliereService } from 'src/app/services/filiere.service';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-niveau',
  templateUrl: './niveau.component.html',
  styleUrls: ['./niveau.component.scss']
})
export class NiveauComponent implements OnInit {

  niveaux: Niveau[] = [];
  filieres: Filiere[] = [];
  filteredNiveaux: Niveau[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  filterLibelle = '';
  filterFiliereId: number | null = null;

  role: Role | Role[] | null = null;
  // 🔹 Pagination
searchTerm = '';
page = 1;
pageSize = 5;

  constructor(
    private niveauService: NiveauService,
    private filiereService: FiliereService,
    private fb: FormBuilder,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.role = this.tokenStorage.getUserRole();

    this.form = this.fb.group({
      code: ['', Validators.required],
      libelle: [''],
      filiereId: [null, Validators.required]
    });

    this.loadFilieres();
    this.loadNiveaux();
  }

  /* ==========================
     CHARGEMENTS
     ========================== */
  loadFilieres(): void {
    this.filiereService.getAll().subscribe({
      next: data => this.filieres = data,
      error: err => console.error(err)
    });
  }

loadNiveaux(): void {
  this.niveauService.getAll().subscribe({
    next: data => {
      this.niveaux = data;
      this.applyFilters();
      this.page = 1;
    },
    error: err => console.error(err)
  });
}

  /* ==========================
     FILTRAGE
     ========================== */
  applyFilters(): void {
  const term = this.searchTerm.toLowerCase().trim();
  const filiereId = this.filterFiliereId;

  this.filteredNiveaux = this.niveaux.filter(n => {
    const code = n.code?.toLowerCase() || '';
    const libelle = n.libelle?.toLowerCase() || '';

    const matchText =
      !term ||
      code.includes(term) ||
      libelle.includes(term);

    const matchFiliere =
      filiereId == null || n.filiereId === filiereId;

    return matchText && matchFiliere;
  });
}


  /* ==========================
     AJOUT / MODIFICATION
     ========================== */
  save(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const payload: Niveau = this.form.value;

    const request$ = this.editingId
      ? this.niveauService.modifier(this.editingId, payload)
      : this.niveauService.creer(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadNiveaux();
      },
      error: err => {
        console.error(err);
        alert('Erreur lors de l’enregistrement');
        this.loading = false;
      }
    });
  }

  /* ==========================
     ÉDITION
     ========================== */
  edit(niveau: Niveau): void {
    this.editingId = niveau.id!;
    this.form.patchValue({
      code: niveau.code,
      libelle: niveau.libelle,
      filiereId: niveau.filiereId
    });
  }

  /* ==========================
     SUPPRESSION
     ========================== */
  delete(id: number): void {
    if (!confirm('Supprimer ce niveau ?')) return;

    this.niveauService.supprimer(id).subscribe({
      next: () => this.loadNiveaux(),
      error: err => console.error(err)
    });
  }

  /* ==========================
     UTILITAIRES
     ========================== */
  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.loading = false;
  }

  getFiliereNom(filiereId: number | undefined): string {
    return this.filieres.find(f => f.id === filiereId)?.nom || '-';
  }

  canEdit(): boolean {
    if (!this.role) return false;

    if (Array.isArray(this.role)) {
      return this.role.includes(Role.Admin) || this.role.includes(Role.Scolarite);
    }

    return this.role === Role.Admin || this.role === Role.Scolarite;
  }
  onSearchChange(): void {
  this.applyFilters();
  this.page = 1;
}

get pagedNiveaux(): Niveau[] {
  const start = (this.page - 1) * this.pageSize;
  return this.filteredNiveaux.slice(start, start + this.pageSize);
}
}