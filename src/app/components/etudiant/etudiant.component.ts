import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EtudiantService } from 'src/app/services/etudiant.service';
import { ClasseService } from 'src/app/services/classe.service';
import { Etudiant } from 'src/app/models/etudiant';
import { Classe } from 'src/app/models/classe';
import { AnneeAcademique } from 'src/app/models/annee-academique';
import { FiliereService } from 'src/app/services/filiere.service';
import { NiveauService } from 'src/app/services/niveau.service';
import { Filiere } from 'src/app/models/filiere';
import { Niveau } from 'src/app/models/niveau';



@Component({
  selector: 'app-etudiant',
  templateUrl: './etudiant.component.html',
  styleUrls: ['./etudiant.component.scss']
})

export class EtudiantComponent implements OnInit {


  /* ==========================
     DONNÉES
  ========================== */
  etudiants: Etudiant[] = [];
  filteredEtudiants: Etudiant[] = [];
  filieres: Filiere[] = [];
niveaux: Niveau[] = [];

  classes: Classe[] = [];
  anneesAcademiques: AnneeAcademique[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  /* ==========================
     FILTRE + PAGINATION
  ========================== */
  filterNom = '';
  filterClasseId: number | null = null;

  page = 1;
  pageSize = 5;

  constructor(
    private fb: FormBuilder,
    private etudiantService: EtudiantService,
    private classeService: ClasseService,
    private filiereService: FiliereService,
  private niveauService: NiveauService
  ) {}

  /* ==========================
     INIT
  ========================== */
  ngOnInit(): void {
      this.initForm();
  this.loadClasses();
  this.loadFilieres();
  this.loadNiveaux();
  this.loadAnneesAcademiques();
  this.loadEtudiants();
  
  }

  private initForm(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      matricule: ['', Validators.required],
      dateNaissance: [''],
      sexe: ['', Validators.required],
      nationalite: ['', Validators.required],
      etatCivil: ['', Validators.required],
      classeId: [null, Validators.required],
      filiereId: [null, Validators.required],
      niveauId: [null, Validators.required],
      contactEtudiant: ['', Validators.required],
      lieuNaissance: ['', Validators.required],
      contactUrgence: ['', Validators.required],
      anneeAcademiqueId: [null, Validators.required]
    });
  }


  /* ==========================
     LOADERS
  ========================== */
  loadFilieres(): void {
  this.filiereService.getAll().subscribe(data => {
    this.filieres = data;
  });
}

loadNiveaux(): void {
  this.niveauService.getAll().subscribe(data => {
    this.niveaux = data;
  });
}
  loadClasses(): void {
    this.classeService.getAll().subscribe(data => {
      this.classes = data;
      this.tryEnrich();
    });
  }

  loadAnneesAcademiques(): void {
    this.anneesAcademiques = [
      { id: 1, libelle: '2025-2026' },
      { id: 2, libelle: '2026-2027' }
    ];
    this.tryEnrich();
  }

  loadEtudiants(): void {
    this.etudiantService.getAll().subscribe(data => {
      this.etudiants = data;
      this.tryEnrich();
    });
  }

  /* ==========================
     ENRICHISSEMENT (ID → OBJET)
  ========================== */
  private tryEnrich(): void {
    if (!this.etudiants.length || !this.classes.length || !this.anneesAcademiques.length) {
      return;
    }

    this.etudiants = this.etudiants.map(e => ({
      ...e,
      classe: this.classes.find(c => c.id === e.classeId),
      anneeAcademique: this.anneesAcademiques.find(a => a.id === e.anneeAcademiqueId)
    }));

    this.applyFilters();
  }

  /* ==========================
     FILTRE + PAGINATION
  ========================== */
  applyFilters(): void {
    const term = this.filterNom.toLowerCase().trim();

    this.filteredEtudiants = this.etudiants.filter(e =>
      (!term ||
        e.nom.toLowerCase().includes(term) ||
        e.prenom.toLowerCase().includes(term)) &&
      (!this.filterClasseId || e.classeId === this.filterClasseId)
    );

    this.page = 1;
  }

  get pagedEtudiants(): Etudiant[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredEtudiants.slice(start, start + this.pageSize);
  }

  /* ==========================
     CRUD
  ========================== */
  save(): void {
    if (this.form.invalid) return;

    this.loading = true;

 const payload: Etudiant = {
  nom: this.form.value.nom,
  prenom: this.form.value.prenom,
  email: this.form.value.email,
  password: this.form.value.password,

  matricule: this.form.value.matricule,
  dateNaissance: this.form.value.dateNaissance,
  sexe: this.form.value.sexe,
  nationalite: this.form.value.nationalite,
  etatCivil: this.form.value.etatCivil,
  contactEtudiant: this.form.value.contactEtudiant,
  lieuNaissance: this.form.value.lieuNaissance,
  contactUrgence: this.form.value.contactUrgence,
  filiereId: this.form.value.filiereId,
  niveauId: this.form.value.niveauId,
  classeId: this.form.value.classeId,
  anneeAcademiqueId: this.form.value.anneeAcademiqueId,

  roles: ['ROLE_ETUDIANT']
};



    const req$ = this.editingId
      ? this.etudiantService.modifier(this.editingId, payload)
      : this.etudiantService.creer(payload);

    req$.subscribe({
      next: () => {
        this.resetForm();
        this.loadEtudiants();
      },
      complete: () => this.loading = false
    });
  }

  edit(e: Etudiant): void {
    this.editingId = e.id!;

    this.form.patchValue({
      nom: e.nom,
      prenom: e.prenom,
      email: e.email,
      matricule: e.matricule,
      dateNaissance: e.dateNaissance,
      sexe: e.sexe,
      nationalite: e.nationalite,
      etatCivil: e.etatCivil,
      classeId: e.classeId,
      anneeAcademiqueId: e.anneeAcademiqueId
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.loading = false;
  }
  /* ==========================
   EXPORTS
========================== */

exportExcel(): void {
  console.log('Export Excel...');
  // TODO: brancher avec un vrai service (xlsx)
}

exportCSV(): void {
  console.log('Export CSV...');
  // TODO: génération CSV
}

exportPDF(): void {
  console.log('Export PDF...');
  // TODO: appel backend PDF
}

importFile(event: any): void {
  const file = event.target.files[0];
  if (!file) return;

  console.log('Fichier importé :', file.name);
  // TODO: envoyer au backend
}
}
