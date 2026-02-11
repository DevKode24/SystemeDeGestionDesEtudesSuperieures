import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AnneeAcademique } from 'src/app/models/annee-academique';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-annee-academique',
  templateUrl: './annee-academique-list.component.html',
  styleUrls: ['./annee-academique-list.component.scss']
})
export class AnneeAcademiqueComponent implements OnInit {

  /* ================== DATA ================== */
  annees: AnneeAcademique[] = [];
  filteredAnnees: AnneeAcademique[] = [];
  pagedAnnees: AnneeAcademique[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  /* ================== SEARCH ================== */
  filterLibelle = '';

  /* ================== PAGINATION ================== */
  page = 1;
  pageSize = 5;

  constructor(
    private anneeService: AnneeAcademiqueService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAnnees();
  }

  private initForm(): void {
    this.form = this.fb.group({
      libelle: ['', Validators.required]
    });
  }

  /* ================== LOAD ================== */
  loadAnnees(): void {
    this.anneeService.getAll().subscribe({
      next: data => {
        this.annees = data ?? [];
        this.applyFilters();
      },
      error: () => alert('Erreur de chargement')
    });
  }

  /* ================== FILTER ================== */
  applyFilters(): void {
    const term = this.filterLibelle.toLowerCase().trim();

    this.filteredAnnees = this.annees.filter(a =>
      !term || a.libelle.toLowerCase().includes(term)
    );

    this.page = 1;
    this.updatePagination();
  }

  /* ================== PAGINATION ================== */
  updatePagination(): void {
    const start = (this.page - 1) * this.pageSize;
    this.pagedAnnees = this.filteredAnnees.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.page * this.pageSize < this.filteredAnnees.length) {
      this.page++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.updatePagination();
    }
  }

  /* ================== CRUD ================== */
  save(): void {
    if (this.form.invalid) return;

    const payload: AnneeAcademique = {
      libelle: this.form.value.libelle
    };

    const req$ = this.editingId
      ? this.anneeService.modifier(this.editingId, payload)
      : this.anneeService.creer(payload);

    req$.subscribe(() => {
      this.resetForm();
      this.loadAnnees();
    });
  }

  edit(a: AnneeAcademique): void {
    if (!a.id) return;
    this.editingId = a.id;
    this.form.patchValue({ libelle: a.libelle });
  }

  supprimer(id: number): void {
    if (!confirm('Supprimer cette année académique ?')) return;
    this.anneeService.supprimer(id).subscribe(() => this.loadAnnees());
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
  }

  /* ================== EXPORT ================== */
  exportExcel(): void {
    const data = this.filteredAnnees.map(a => ({
      Libelle: a.libelle
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Annees');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'annees_academiques.xlsx');
  }

  exportCSV(): void {
    const ws = XLSX.utils.json_to_sheet(this.filteredAnnees);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv]), 'annees_academiques.csv');
  }

  /* ================== IMPORT ================== */
  importFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      rows.forEach(row => {
        if (row.Libelle || row.libelle) {
          this.anneeService.creer({ libelle: row.Libelle ?? row.libelle })
            .subscribe();
        }
      });

      this.loadAnnees();
    };

    reader.readAsBinaryString(file);
  }
}
