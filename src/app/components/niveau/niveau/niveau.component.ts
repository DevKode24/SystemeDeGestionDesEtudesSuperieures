import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TokenStorageService, Role } from 'src/app/auth/token-storage.service';
import { Niveau } from 'src/app/models/niveau';
import { NiveauService } from 'src/app/services/niveau.service';
import { Filiere } from 'src/app/models/filiere';
import { FiliereService } from 'src/app/services/filiere.service';

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

  filterLibelle: string = '';
  filterFiliereId: number | null = null;

  role: Role | Role[] | null = null;

  constructor(
    private niveauService: NiveauService,
    private filiereService: FiliereService,
    private fb: FormBuilder,
    private tokenStorage: TokenStorageService
  ) {}
  getFiliereNom(filiereId: number | undefined): string {
  const filiere = this.filieres.find(f => f.id === filiereId);
  return filiere ? filiere.nom : '-';
}


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
     CHARGEMENT
     ========================== */
  loadFilieres(): void {
    this.filiereService.getAll().subscribe(data => this.filieres = data);
  }

  loadNiveaux(): void {
    this.niveauService.getAll().subscribe(data => {
      this.niveaux = data;
      this.applyFilters();
    });
  }

  /* ==========================
     FILTRAGE
     ========================== */
applyFilters(): void {
  const libelleFilter = (this.filterLibelle ?? '').toLowerCase().trim();
  const filiereFilter = this.filterFiliereId;

  this.filteredNiveaux = this.niveaux.filter(n => {

    const code = (n.code ?? '').toLowerCase();
    const libelle = (n.libelle ?? '').toLowerCase();

    const matchNom =
      !libelleFilter ||
      code.includes(libelleFilter) ||
      libelle.includes(libelleFilter);

    const matchFiliere =
      filiereFilter == null || n.filiereId === filiereFilter;

    return matchNom && matchFiliere;
  });
}


  /* ==========================
     AJOUT / MODIFICATION
     ========================== */
  save(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const niveau: Niveau = this.form.value;

    if (this.editingId) {
      this.niveauService.modifier(this.editingId, niveau).subscribe(() => {
        this.resetForm();
        this.loadNiveaux();
      });
    } else {
      this.niveauService.creer(niveau).subscribe(() => {
        this.resetForm();
        this.loadNiveaux();
      });
    }
    console.log(niveau);
  }

  /* ==========================
     MODE ÉDITION
     ========================== */
  edit(niveau: Niveau): void {
    this.editingId = niveau.id!;
    this.form.patchValue({
      nom: niveau.nom,
      code: niveau.code,
      libelle: niveau.libelle,
      filiereId: niveau.filiereId || null
    });
  }

  /* ==========================
     SUPPRESSION
     ========================== */
  delete(id: number): void {
    if (!confirm('Supprimer ce niveau ?')) return;

    this.niveauService.supprimer(id).subscribe(() => this.loadNiveaux());
  }

  /* ==========================
     RESET
     ========================== */
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

    if (Array.isArray(this.role)) {
      return this.role.includes(Role.Admin) || this.role.includes(Role.Scolarite);
    }

    return this.role === Role.Admin || this.role === Role.Scolarite;
  }

}
