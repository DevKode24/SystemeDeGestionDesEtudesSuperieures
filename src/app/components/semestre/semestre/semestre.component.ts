import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Semestre } from 'src/app/models/semestre';
import { AnneeAcademique } from 'src/app/models/annee-academique';
import { SemestreService } from 'src/app/services/semestre.service';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';

@Component({
  selector: 'app-semestre',
  templateUrl: './semestre.component.html',
  styleUrls: ['./semestre.component.scss']
})
export class SemestreComponent implements OnInit {

  form!: FormGroup;
  semestres: Semestre[] = [];
  filteredSemestres: Semestre[] = [];
  anneesAcademiques: AnneeAcademique[] = [];
  editingId: number | null = null;
  loading = false;

  // Recherche & pagination
  searchTerm = '';
  page = 1;
  pageSize = 5;
  pageSizes = [5, 10, 20, 50];

  // Dropdown export
  dropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private semestreService: SemestreService,
    private anneeService: AnneeAcademiqueService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAnneesAcademiques();
    this.loadSemestres();
  }

  // ================= FORM =================
  initForm(): void {
    this.form = this.fb.group({
      numero: [null, Validators.required],
      anneeAcademiqueId: [null, Validators.required]
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset();
  }

  // ================= LOAD DATA =================
  loadAnneesAcademiques(): void {
    this.anneeService.getAll().subscribe({
      next: data => this.anneesAcademiques = data
    });
  }

  loadSemestres(): void {
    this.semestreService.getAll().subscribe({
      next: data => {
        this.semestres = data;
        this.applyFilter();
      }
    });
  }

  // ================= CRUD =================
  save(): void {
    if (this.form.invalid) return;

    const payload = {
      numero: this.form.value.numero,
      anneeAcademique: { id: this.form.value.anneeAcademiqueId }
    };

    const request$ = this.editingId
      ? this.semestreService.update(this.editingId, payload)
      : this.semestreService.create(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadSemestres();
      }
    });
  }

  edit(s: Semestre): void {
    this.editingId = s.id!;
    this.form.patchValue({
      numero: s.numero,
      anneeAcademiqueId: s.anneeAcademique?.id
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer ce semestre ?')) return;
    this.semestreService.delete(id).subscribe({ next: () => this.loadSemestres() });
  }

  // ================= FILTER / PAGINATION =================
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSemestres = this.semestres.filter(s =>
      `semestre ${s.numero}`.toLowerCase().includes(term) ||
      (s.anneeAcademique?.libelle?.toLowerCase().includes(term) ?? false)
    );
    this.page = 1;
  }

  paginatedData(): Semestre[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredSemestres.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredSemestres.length / this.pageSize);
  }

  // ================= IMPORT =================
  importExcel(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = XLSX.utils.sheet_to_json<any>(
        workbook.Sheets[workbook.SheetNames[0]]
      );

      sheet.forEach(row => {
        if (row.numero && row.anneeAcademiqueId) {
          this.semestreService.create({
            numero: row.numero,
            anneeAcademique: { id: row.anneeAcademiqueId }
          }).subscribe();
        }
      });

      this.loadSemestres();
    };
    reader.readAsBinaryString(file);
  }

  // ================= EXPORT DROPDOWN =================
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  export(format: 'excel' | 'csv' | 'pdf'): void {
    if (format === 'excel') {
      const data = this.semestres.map(s => ({
        Semestre: `Semestre ${s.numero}`,
        'Année Académique': s.anneeAcademique?.libelle
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Semestres');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([buffer]), 'semestres.xlsx');

    } else if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(this.semestres.map(s => ({
        numero: s.numero,
        annee: s.anneeAcademique?.libelle
      })));
      const csv = XLSX.utils.sheet_to_csv(ws);
      saveAs(new Blob([csv]), 'semestres.csv');

    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(63, 81, 181);
      doc.text('Liste des Semestres Académiques', 14, 22);

      const body = this.semestres.map((s, i) => [
        i + 1,
        `Semestre ${s.numero}`,
        s.anneeAcademique?.libelle ?? ''
      ]);

      (doc as any).autoTable({
        head: [['#', 'Semestre', 'Année Académique']],
        body,
        startY: 30,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 243, 255] }
      });

      doc.save('semestres.pdf');
    }

    this.closeDropdown();
  }
}
