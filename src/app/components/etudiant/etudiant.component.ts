import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { EtudiantService } from 'src/app/services/etudiant.service';
import { ClasseService } from 'src/app/services/classe.service';
import { FiliereService } from 'src/app/services/filiere.service';
import { NiveauService } from 'src/app/services/niveau.service';

import { Etudiant } from 'src/app/models/etudiant';
import { Classe } from 'src/app/models/classe';
import { Filiere } from 'src/app/models/filiere';
import { Niveau } from 'src/app/models/niveau';
import { AnneeAcademique } from 'src/app/models/annee-academique';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';
@Component({
  selector: 'app-etudiant',
  templateUrl: './etudiant.component.html',
  styleUrls: ['./etudiant.component.scss']
})

export class EtudiantComponent implements OnInit {

  /* ================= DONNÉES ================= */
  etudiants: Etudiant[] = [];
  filteredEtudiants: Etudiant[] = [];

  classes: Classe[] = [];
  filieres: Filiere[] = [];
  niveaux: Niveau[] = [];
  anneesAcademiques: AnneeAcademique[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  /* ================= FILTRES ================= */
  searchTerm = '';
  filterClasseId: number | null = null;
  filterNom = ''; // ✅ correction erreur [(ngModel)]="filterNom"

  /* ================= PAGINATION ================= */
  page = 1;
  pageSize = 5;

  constructor(
    private fb: FormBuilder,
    private etudiantService: EtudiantService,
    private classeService: ClasseService,
    private filiereService: FiliereService,
    private niveauService: NiveauService,
    private anneeService: AnneeAcademiqueService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllData();
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

  private loadAllData(): void {
    this.loading = true;

    forkJoin({
      etudiants: this.etudiantService.getAll(),
      classes: this.classeService.getAll(),
      filieres: this.filiereService.getAll(),
      niveaux: this.niveauService.getAll(),
      annees: this.anneeService.getAll()
    }).subscribe({
      next: res => {
        this.classes = res.classes;
        this.filieres = res.filieres;
        this.niveaux = res.niveaux;
        this.anneesAcademiques = res.annees;

        // ✅ mapping sécurisé des objets enrichis
        this.etudiants = res.etudiants.map(e => ({
          ...e,
          classe: this.classes.find(c => c.id === e.classeId),
          filiere: this.filieres.find(f => f.id === e.filiereId),
          niveau: this.niveaux.find(n => n.id === e.niveauId),
          anneeAcademique: this.anneesAcademiques.find(a => a.id === e.anneeAcademiqueId)
        }));

        this.applyFilters();
      },
      error: (err: HttpErrorResponse) => console.error(err),
      complete: () => this.loading = false
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredEtudiants = this.etudiants.filter(e =>
      (!term ||
        (e.nom?.toLowerCase() ?? '').includes(term) ||
        (e.prenom?.toLowerCase() ?? '').includes(term) ||
        (e.email?.toLowerCase() ?? '').includes(term) ||
        (e.matricule ?? '').toLowerCase().includes(term)
      ) &&
      (!this.filterClasseId || e.classeId === this.filterClasseId)
    );

    this.page = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  get pagedEtudiants(): Etudiant[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredEtudiants.slice(start, start + this.pageSize);
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const payload: Etudiant = { ...this.form.value, roles: ['ROLE_ETUDIANT'] };

    const request$ = this.editingId
      ? this.etudiantService.modifier(this.editingId, payload)
      : this.etudiantService.creer(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadAllData();
      },
      error: (err: HttpErrorResponse) => console.error(err),
      complete: () => this.loading = false
    });
  }

  edit(e: Etudiant): void {
    this.editingId = e.id!;
    this.form.patchValue({
      ...e,
      classeId: e.classeId ?? e.classe?.id,
      filiereId: e.filiereId ?? e.filiere?.id,
      niveauId: e.niveauId ?? e.niveau?.id,
      anneeAcademiqueId: e.anneeAcademiqueId ?? e.anneeAcademique?.id
    });
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cet étudiant ?')) return;
    this.etudiantService.supprimer(id).subscribe(() => this.loadAllData());
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.loading = false;
  }

  // ✅ EXPORT / IMPORT comme avant


  /* ================= EXPORT ================= */

  exportExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.filteredEtudiants.map(e => ({
      Nom: e.nom,
      Prénom: e.prenom,
      Email: e.email,
      Matricule: e.matricule,
      Classe: e.classe?.code ?? '',
Filière: e.filiere?.nom ?? '',
Niveau: e.niveau?.libelle ?? '',
Année: e.anneeAcademique?.libelle ?? ''

    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Etudiants');
    XLSX.writeFile(wb, 'etudiants.xlsx');
  }

  exportCSV(): void {
    const ws = XLSX.utils.json_to_sheet(this.filteredEtudiants);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'etudiants.csv');
  }

  exportPDF(): void {
    const doc = new jsPDF();

    (doc as any).autoTable({
      head: [['Nom', 'Prénom', 'Email', 'Matricule', 'Classe', 'Filière', 'Niveau', 'Année']],
      body: this.filteredEtudiants.map(e => [
        e.nom,
        e.prenom,
        e.email,
        e.matricule,
        e.classe?.code ?? '',
        e.filiere?.nom ?? '',
        e.niveau?.libelle ?? '',
        e.anneeAcademique?.libelle ?? ''
      ])
    });

    doc.save('etudiants.pdf');
  }

  /* ================= IMPORT (STRUCTURE PRÊTE) ================= */

  importFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      console.log('Import Étudiants détecté:', data);
      alert('Import détecté – mapping backend à brancher');
    };

    reader.readAsBinaryString(file);
  }

}
