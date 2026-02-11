import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { forkJoin } from 'rxjs';

import { Matiere } from 'src/app/models/matiere';
import { Ue } from 'src/app/models/ue';
import { Enseignant } from 'src/app/models/enseignant';

import { MatiereService } from 'src/app/services/matiere.service';
import { UeService } from 'src/app/services/ue.service';
import { EnseignantService } from 'src/app/services/enseignant.service';

@Component({
  selector: 'app-matiere',
  templateUrl: './matiere.component.html',
  styleUrls: ['./matiere.component.scss']
})
export class MatiereComponent implements OnInit {

  matieres: Matiere[] = [];
  filteredMatieres: Matiere[] = [];

  ues: Ue[] = [];
  enseignants: Enseignant[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  /* ================= FILTRES ================= */
  searchTerm = '';
  filterUe = '';
  filterEnseignant = '';

  /* ================= PAGINATION ================= */
  page = 1;
  pageSize = 5;

  constructor(
    private fb: FormBuilder,
    private matiereService: MatiereService,
    private ueService: UeService,
    private enseignantService: EnseignantService
  ) {}

  /* ================= INIT ================= */
  ngOnInit(): void {
    this.initForm();
    this.loadAllData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      intitule: ['', Validators.required],
      coefficient: [1, [Validators.required, Validators.min(1)]],
      ueId: [null, Validators.required],
      enseignantId: [null]
    });
  }

  /* ================= CHARGEMENT GLOBAL ================= */
  private loadAllData(): void {
    forkJoin({
      matieres: this.matiereService.getAll(),
      ues: this.ueService.getAll(),
      enseignants: this.enseignantService.getAll()
    }).subscribe(res => {

      this.ues = res.ues;
      this.enseignants = res.enseignants;

      // 🔥 ENRICHISSEMENT INTELLIGENT
      this.matieres = res.matieres.map(m => ({
        ...m,
        ue: this.ues.find(u => u.id === m.ueId),
        enseignant: this.enseignants.find(e => e.id === m.enseignantId)
      }));

      this.applyFilters();
    });
  }

  /* ================= FILTRES ================= */
  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const ue = this.filterUe.toLowerCase();
    const ens = this.filterEnseignant.toLowerCase();

    this.filteredMatieres = this.matieres.filter(m =>
      (!term || m.intitule.toLowerCase().includes(term) || m.code.toLowerCase().includes(term)) &&
      (!ue || (m.ue?.intitule ?? '').toLowerCase().includes(ue)) &&
      (!ens || `${m.enseignant?.nom ?? ''} ${m.enseignant?.prenom ?? ''}`.toLowerCase().includes(ens))
    );

    this.page = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  get pagedMatieres(): Matiere[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredMatieres.slice(start, start + this.pageSize);
  }

  /* ================= CRUD ================= */
  save(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const payload: Matiere = this.form.value;

    const action$ = this.editingId
      ? this.matiereService.modifier(this.editingId, payload)
      : this.matiereService.creer(payload);

    action$.subscribe({
      next: () => {
        this.resetForm();
        this.loadAllData();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur backend Matière', err);
      },
      complete: () => this.loading = false
    });
  }

  edit(m: Matiere): void {
    this.editingId = m.id!;
    this.form.patchValue({
      code: m.code,
      intitule: m.intitule,
      coefficient: m.coefficient,
      ueId: m.ueId ?? m.ue?.id,
      enseignantId: m.enseignantId ?? m.enseignant?.id ?? null
    });
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette matière ?')) return;
    this.matiereService.supprimer(id).subscribe(() => this.loadAllData());
  }

  resetForm(): void {
    this.form.reset({ coefficient: 1 });
    this.editingId = null;
    this.loading = false;
  }

  
  /* ================= EXPORT ================= */
  exportExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.filteredMatieres.map(m => ({
      Code: m.code,
      Matiere: m.intitule,
      UE: m.ue?.intitule,
      Enseignant: m.enseignant ? `${m.enseignant.nom} ${m.enseignant.prenom}` : '',
      Coefficient: m.coefficient
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matieres');
    XLSX.writeFile(wb, 'matieres.xlsx');
  }

  exportCSV(): void {
    const ws = XLSX.utils.json_to_sheet(this.filteredMatieres.map(m => ({
      Code: m.code,
      Matiere: m.intitule,
      UE: m.ue?.intitule,
      Enseignant: m.enseignant ? `${m.enseignant.nom} ${m.enseignant.prenom}` : '',
      Coefficient: m.coefficient
    })));
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'matieres.csv');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [['Code', 'Matière', 'UE', 'Enseignant', 'Coef']],
      body: this.filteredMatieres.map(m => [
        m.code,
        m.intitule,
        m.ue?.intitule ?? '',
        m.enseignant ? `${m.enseignant.nom} ${m.enseignant.prenom}` : '',
        m.coefficient
      ])
    });
    doc.save('matieres.pdf');
  }

  /* ================= IMPORT (STRUCTURE PRÊTE) ================= */
  importFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const wb = XLSX.read(e.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      console.log('Import Matières:', data);
      alert('Import détecté – mapping backend à brancher');
    };
    reader.readAsBinaryString(file);
  }
}
