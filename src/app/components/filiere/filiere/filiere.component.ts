import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role, TokenStorageService } from 'src/app/auth/token-storage.service';
import { Filiere } from 'src/app/models/filiere';
import { FiliereService } from 'src/app/services/filiere.service';
@Component({
  selector: 'app-filiere',
  templateUrl: './filiere.component.html',
  styleUrls: ['./filiere.component.scss']
})
export class FiliereComponent implements OnInit {

  /* ==========================
     DONNÉES
  ========================== */
  filieres: Filiere[] = [];
  filteredFilieres: Filiere[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  // 🔹 Pagination
  searchTerm = '';
  page = 1;
  pageSize = 5;

  role: Role | Role[] | null = null;

  constructor(
    private service: FiliereService,
    private fb: FormBuilder,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.role = this.tokenStorage.getUserRole();

    this.form = this.fb.group({
      nom: ['', Validators.required],
      code: ['', Validators.required],
      description: ['']
    });

    this.loadFilieres();
  }

  /* ==========================
     CHARGEMENT
  ========================== */
  loadFilieres(): void {
    this.service.getAll().subscribe(data => {
      this.filieres = data;
      this.applyFilter();
    });
  }

  /* ==========================
     FILTRE + PAGINATION
  ========================== */
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredFilieres = this.filieres.filter(f =>
      f.nom.toLowerCase().includes(term) ||
      f.code.toLowerCase().includes(term)
    );
  }

  onSearchChange(): void {
    this.applyFilter();
    this.page = 1;
  }

  get pagedFilieres(): Filiere[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredFilieres.slice(start, start + this.pageSize);
  }

  /* ==========================
     CRUD
  ========================== */
  save(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const filiere: Filiere = this.form.value;

    const action$ = this.editingId
      ? this.service.modifier(this.editingId, filiere)
      : this.service.creer(filiere);

    action$.subscribe({
      next: () => {
        this.resetForm();
        this.loadFilieres();
      },
      complete: () => this.loading = false
    });
  }

  edit(f: Filiere): void {
    this.editingId = f.id!;
    this.form.patchValue({
      nom: f.nom,
      code: f.code,
      description: f.description
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette filière ?')) return;
    this.service.supprimer(id).subscribe(() => this.loadFilieres());
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
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
