import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { TokenStorageService, Role } from 'src/app/auth/token-storage.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];

  form!: FormGroup;
  editingId: number | null = null;

  filterNom = '';
  filterEmail = '';
  filterRole: string | null = null;

  rolesDisponibles = ['ADMIN', 'SCOLARITE', 'ENSEIGNANT', 'ETUDIANT'];
  userRoles: Role | Role[] | null = null;

  showPasswordModal = false;
  selectedUser!: User;
  newPassword = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.userRoles = this.tokenStorage.getUserRole();

    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required], // obligatoire à la création
      roles: ['ETUDIANT', Validators.required]
    });

    this.loadUsers();
  }

  canAdmin(): boolean {
    if (!this.userRoles) return false;
    if (Array.isArray(this.userRoles)) return this.userRoles.includes(Role.Admin);
    return this.userRoles === Role.Admin;
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: data => {
        this.users = data;
        this.applyFilters();
      },
      error: err => {
        console.error(err);
        if (err.status === 403) alert('Accès refusé par le serveur');
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(u =>
      (!this.filterNom || u.nom.toLowerCase().includes(this.filterNom.toLowerCase())) &&
      (!this.filterEmail || u.email.toLowerCase().includes(this.filterEmail.toLowerCase())) &&
      (!this.filterRole || u.roles.includes(this.filterRole))
    );
  }

save(): void {
  if (this.form.invalid) {
    alert('Veuillez remplir tous les champs obligatoires.');
    return;
  }

  // Toujours récupérer password
  const password = this.form.value.password;
  if (!password || password.trim() === '') {
    alert('Le mot de passe est obligatoire');
    return;
  }

  // Toujours envoyer roles comme tableau
  const rolesValue = this.form.value.roles;
  const rolesArray = Array.isArray(rolesValue) ? rolesValue : [rolesValue];

  // Construire le payload correctement pour le backend
  const payload: User = {
    id: this.editingId ?? undefined,
    nom: this.form.value.nom,
    prenom: this.form.value.prenom,
    email: this.form.value.email,
    password: password, // jamais undefined
    roles: rolesArray
  };

  console.log('Payload utilisateur:', payload);

  const request$ = !this.editingId
    ? this.userService.create(payload)
    : this.userService.update(this.editingId, payload);

  request$.subscribe({
    next: (savedUser) => {
      alert(this.editingId ? 'Utilisateur mis à jour' : 'Utilisateur créé');
      this.resetForm();
      this.loadUsers();
    },
    error: (err) => {
      console.error('Erreur création/utilisateur', err);
      alert(err.error?.message || 'Erreur inconnue.');
    }
  });
}



  edit(u: User): void {
    this.editingId = u.id!;
    this.form.patchValue({
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      password: '',
      roles: u.roles.length > 0 ? u.roles[0] : 'ETUDIANT'
    });
  }

  resetForm(): void {
    this.form.reset({ roles: 'ETUDIANT' });
    this.editingId = null;
  }

  activer(u: User): void {
    this.userService.activerCompte(u.id!).subscribe(() => this.loadUsers());
  }

  desactiver(u: User): void {
    this.userService.desactiverCompte(u.id!).subscribe(() => this.loadUsers());
  }

  openPasswordModal(u: User): void {
    this.selectedUser = u;
    this.newPassword = '';
    this.showPasswordModal = true;
  }

  changePassword(): void {
    if (this.newPassword.length < 6) {
      alert('Mot de passe trop court (minimum 6 caractères)');
      return;
    }

    this.userService.changerMotDePasse(this.selectedUser.id!, this.newPassword).subscribe({
      next: () => {
        this.showPasswordModal = false;
        alert('Mot de passe modifié avec succès');
      },
      error: err => {
        console.error('Erreur modification mot de passe', err);
        alert('Erreur lors de la modification du mot de passe.');
      }
    });
  }
}