import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Filiere } from 'src/app/models/filiere';
import { FiliereService } from 'src/app/services/filiere.service';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-filiere',
  templateUrl: './filiere.component.html',
  styleUrls: ['./filiere.component.scss']
})
export class FiliereComponent implements OnInit {

  /* ================== DATA ================== */
  filieres: Filiere[] = [];
  filteredFilieres: Filiere[] = [];
  pagedFilieres: Filiere[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  /* ================== SEARCH ================== */
  filterValue = '';

  /* ================== PAGINATION ================== */
  page = 1;
  pageSize = 5;

  constructor(
    private filiereService: FiliereService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFilieres();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      code: ['', Validators.required],
      description: ['']
    });
  }

  /* ================== LOAD ================== */
  loadFilieres(): void {
    this.filiereService.getAll().subscribe({
      next: data => {
        this.filieres = data ?? [];
        this.applyFilters();
      },
      error: () => alert('Erreur de chargement des filières')
    });
  }

  /* ================== FILTER ================== */
  applyFilters(): void {
    const term = this.filterValue.toLowerCase().trim();

    this.filteredFilieres = this.filieres.filter(f =>
      !term ||
      f.nom.toLowerCase().includes(term) ||
      f.code.toLowerCase().includes(term)
    );

    this.page = 1;
    this.updatePagination();
  }

  /* ================== PAGINATION ================== */
  updatePagination(): void {
    const start = (this.page - 1) * this.pageSize;
    this.pagedFilieres = this.filteredFilieres.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.page * this.pageSize < this.filteredFilieres.length) {
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

    const payload: Filiere = this.form.value;

    const req$ = this.editingId
      ? this.filiereService.modifier(this.editingId, payload)
      : this.filiereService.creer(payload);

    req$.subscribe(() => {
      this.resetForm();
      this.loadFilieres();
    });
  }

  edit(f: Filiere): void {
    if (!f.id) return;
    this.editingId = f.id;
    this.form.patchValue(f);
  }

  supprimer(id: number): void {
    if (!confirm('Supprimer cette filière ?')) return;
    this.filiereService.supprimer(id).subscribe(() => this.loadFilieres());
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
  }

  /* ================== EXPORT ================== */
  exportExcel(): void {
    const data = this.filteredFilieres.map(f => ({
      Nom: f.nom,
      Code: f.code,
      Description: f.description ?? ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filieres');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'filieres.xlsx');
  }

  exportCSV(): void {
    const ws = XLSX.utils.json_to_sheet(this.filteredFilieres);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv]), 'filieres.csv');
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
        if (row.Nom && row.Code) {
          this.filiereService.creer({
            nom: row.Nom,
            code: row.Code,
            description: row.Description ?? ''
          }).subscribe();
        }
      });

      this.loadFilieres();
    };

    reader.readAsBinaryString(file);
  }
}
