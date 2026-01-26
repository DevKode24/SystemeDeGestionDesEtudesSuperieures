import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Enseignant } from 'src/app/models/enseignant';
import { EnseignantService } from 'src/app/services/enseignant.service';
import { TokenStorageService, Role } from 'src/app/auth/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enseignant',
  templateUrl: './enseignant.component.html',
  styleUrls: ['./enseignant.component.scss']
})
export class EnseignantComponent implements OnInit {

  enseignants: Enseignant[] = [];
  filteredEnseignants: Enseignant[] = [];
  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  filterNom = '';
  filterPrenom = '';
  filterRole: Role | null = null;

  rolesDisponibles: string[] = ['ADMIN', 'SCOLARITE', 'ENSEIGNANT', 'ETUDIANT'];
  userRoles: Role | Role[] | null = null;

  constructor(
    private enseignantService: EnseignantService,
    private fb: FormBuilder,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRoles = this.tokenStorage.getUserRole();

    if (!this.canAccess()) {
      alert('Accès refusé');
      this.router.navigate(['/login']);
      return;
    }

    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      specialite: ['', Validators.required],
      grade: ['', Validators.required],
      roles: ['ENSEIGNANT', Validators.required] // string
    });

    this.loadEnseignants();
  }

  canAccess(): boolean {
    const allowed = ['ADMIN', 'SCOLARITE', 'ENSEIGNANT'];
    if (!this.userRoles) return false;
    if (Array.isArray(this.userRoles)) return this.userRoles.some(r => allowed.includes(r));
    return allowed.includes(this.userRoles as string);
  }

  canEdit(): boolean {
    const allowed = ['ADMIN', 'SCOLARITE'];
    if (!this.userRoles) return false;
    if (Array.isArray(this.userRoles)) return this.userRoles.some(r => allowed.includes(r));
    return allowed.includes(this.userRoles as string);
  }

  loadEnseignants(): void {
    this.enseignantService.getAll().subscribe({
      next: data => {
        this.enseignants = data;
        this.applyFilters();
      },
      error: err => {
        console.error(err);
        if (err.status === 403) alert('Accès refusé par le serveur');
      }
    });
  }

  applyFilters(): void {
    const nom = this.filterNom?.toLowerCase().trim() || '';
    const prenom = this.filterPrenom?.toLowerCase().trim() || '';

    this.filteredEnseignants = this.enseignants.filter(e =>
      (!nom || e.nom.toLowerCase().includes(nom)) &&
      (!prenom || e.prenom.toLowerCase().includes(prenom)) &&
      (!this.filterRole || e.roles.includes(this.filterRole as any))
    );
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const payload: Enseignant = {
      ...(this.editingId && { id: this.editingId }),
  nom: this.form.value.nom,
  prenom: this.form.value.prenom,
  email: this.form.value.email,
  password: this.form.value.password,
  roles: [this.form.value.roles],
  specialite: this.form.value.specialite,
  grade: this.form.value.grade
    };
 console.log("payload", payload);
    const req$ = this.editingId
      ? this.enseignantService.modifier(this.editingId, payload)
      : this.enseignantService.creer(payload);

    req$.subscribe({
      next: () => {
        this.resetForm();
        this.loadEnseignants();
        this.loading = false;
        alert('Enregistré avec succès !');
      },
      error: err => {
        console.error(err);
        if (err.status === 403) {
          alert('Accès refusé. Vérifiez votre token et vos rôles.');
        } else {
          alert('Erreur lors de l’enregistrement.');
        }
        this.loading = false;
      }
    });
  }

  edit(e: Enseignant): void {
    this.editingId = e.id!;
    this.form.patchValue({
      nom: e.nom,
      prenom: e.prenom,
      email: e.email,
      password: '', // On ne pré-remplit pas le password
      specialite: e.specialite,
      grade: e.grade,
      roles: e.roles[0] // première valeur string
    });
  }

  supprimerEnseignant(id: number): void {
    if (!confirm('Supprimer cet enseignant ?')) return;
    this.enseignantService.supprimer(id).subscribe(() => this.loadEnseignants());
  }

  resetForm(): void {
    this.form.reset({ roles: 'ENSEIGNANT' });
    this.editingId = null;
    this.loading = false;
  }
}
