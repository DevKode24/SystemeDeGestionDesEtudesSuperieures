import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role, TokenStorageService } from 'src/app/auth/token-storage.service';
import { Ue } from 'src/app/models/ue';
import { UeService } from 'src/app/services/ue.service';
import { SemestreService } from 'src/app/services/semestre.service';
import { FiliereService } from 'src/app/services/filiere.service';
import { NiveauService } from 'src/app/services/niveau.service';

@Component({
  selector: 'app-ue',
  templateUrl: './ue.component.html',
  styleUrls: ['./ue.component.scss']
})
export class UeComponent implements OnInit {

  /* ==========================
     DONNÉES
  ========================== */
  ues: Ue[] = [];
  filteredUes: Ue[] = [];

  semestres: any[] = [];
  filieres: any[] = [];
  niveaux: any[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  // 🔹 Pagination + recherche (CLONE Filière)
  searchTerm = '';
  page = 1;
  pageSize = 5;

  role: Role | Role[] | null = null;

  constructor(
    private fb: FormBuilder,
    private ueService: UeService,
    private semestreService: SemestreService,
    private filiereService: FiliereService,
    private niveauService: NiveauService,
    private tokenStorage: TokenStorageService
  ) {}

  /* ==========================
     INIT
  ========================== */
  ngOnInit(): void {
    this.role = this.tokenStorage.getUserRole();
    this.initForm();
    this.loadUes();
    this.loadSemestres();
    this.loadFilieres();
    this.loadNiveaux();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      intitule: ['', Validators.required],
      credit: [0, [Validators.required, Validators.min(1)]],
      semestreId: [null, Validators.required],
      filiereId: [null, Validators.required],
      niveauId: [null, Validators.required]
    });
  }

  /* ==========================
     LOAD DATA
  ========================== */
  loadUes(): void {
    this.ueService.getAll().subscribe({
      next: data => {
        this.ues = data;
        this.applyFilter();
      },
      error: err => console.error('Erreur chargement UE', err)
    });
  }

  loadSemestres(): void {
    this.semestreService.getAll().subscribe(data => this.semestres = data);
  }

  loadFilieres(): void {
    this.filiereService.getAll().subscribe(data => this.filieres = data);
  }

  loadNiveaux(): void {
    this.niveauService.getAll().subscribe(data => this.niveaux = data);
  }

  /* ==========================
     FILTRE + PAGINATION
  ========================== */
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredUes = this.ues.filter(u =>
      u.code.toLowerCase().includes(term) ||
      u.intitule.toLowerCase().includes(term)
    );
  }

  onSearchChange(): void {
    this.applyFilter();
    this.page = 1;
  }

  get pagedUes(): Ue[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUes.slice(start, start + this.pageSize);
  }

  /* ==========================
     CRUD
  ========================== */
  save(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const payload: Ue = {
      code: this.form.value.code,
      intitule: this.form.value.intitule,
      credit: this.form.value.credit,
      semestreId: this.form.value.semestreId,
      filiereId: this.form.value.filiereId,
      niveauId: this.form.value.niveauId
    };

    const action$ = this.editingId
      ? this.ueService.modifier(this.editingId, payload)
      : this.ueService.creer(payload);

    action$.subscribe({
      next: () => {
        this.resetForm();
        this.loadUes();
      },
      error: err => {
        console.error('Erreur enregistrement UE', err);
        alert('Erreur lors de l’enregistrement');
      },
      complete: () => this.loading = false
    });
  }

  edit(ue: Ue): void {
    this.editingId = ue.id ?? null;

    this.form.patchValue({
      code: ue.code,
      intitule: ue.intitule,
      credit: ue.credit,
      semestreId: ue.semestreId,
      filiereId: ue.filiereId,
      niveauId: ue.niveauId
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette UE ?')) return;

    this.ueService.supprimer(id).subscribe({
      next: () => this.loadUes(),
      error: err => console.error('Erreur suppression UE', err)
    });
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.loading = false;
  }

  /* ==========================
     DROITS (OPTIONNEL)
  ========================== */
  canEdit(): boolean {
    if (!this.role) return false;
    return Array.isArray(this.role)
      ? this.role.includes(Role.Admin) || this.role.includes(Role.Scolarite)
      : this.role === Role.Admin || this.role === Role.Scolarite;
  }
}
