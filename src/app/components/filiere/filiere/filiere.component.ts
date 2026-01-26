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

  filieres: Filiere[] = [];
  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

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
    this.service.getAll().subscribe(data => this.filieres = data);
  }

  /* ==========================
     AJOUT / MODIFICATION
     ========================== */
  save(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const filiere: Filiere = this.form.value;

    if (this.editingId) {
      this.service.modifier(this.editingId, filiere).subscribe(() => {
        this.resetForm();
        this.loadFilieres();
      });
    } else {
      this.service.creer(filiere).subscribe(() => {
        this.resetForm();
        this.loadFilieres();
      });
    }
  }

  /* ==========================
     MODE ÉDITION
     ========================== */
  edit(filiere: Filiere): void {
    this.editingId = filiere.id!;
    this.form.patchValue({
      nom: filiere.nom,
      code: filiere.code,
      description: filiere.description
    });
  }

  /* ==========================
     SUPPRESSION
     ========================== */
  delete(id: number): void {
    if (!confirm('Supprimer cette filière ?')) return;

    this.service.supprimer(id).subscribe(() => this.loadFilieres());
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
