import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { ClasseService } from 'src/app/services/classe.service';
import { Classe } from 'src/app/models/classe';
import { Filiere } from 'src/app/models/filiere';
import { Niveau } from 'src/app/models/niveau';

@Component({
  selector: 'app-classe',
  templateUrl: './classe.component.html',
  styleUrls: ['./classe.component.scss']
})
export class ClasseComponent implements OnInit {

  classes: Classe[] = [];
  filteredClasses: Classe[] = [];
  filieres: Filiere[] = [];
  niveaux: Niveau[] = [];
  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  // Recherche + pagination
  searchTerm = '';
  page = 1;
  pageSize = 5;

  constructor(private fb: FormBuilder, private classeService: ClasseService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadOptions();
    this.loadClasses();
  }

  initForm(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      filiereId: [null, Validators.required],
      niveauId: [null, Validators.required],
      active: [true]
    });
  }

  /* ========================== CHARGEMENT ========================== */
  loadOptions(): void {
    this.classeService.getFilieres().subscribe(r => this.filieres = r);
    this.classeService.getNiveaux().subscribe(r => this.niveaux = r);
  }

  loadClasses(): void {
    this.classeService.getAll().subscribe(data => {
      this.classes = data;
      this.applyFilter();
    });
  }

  /* ========================== FILTRE + PAGINATION ========================== */
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredClasses = this.classes.filter(c =>
      c.code.toLowerCase().includes(term) ||
      (c.filiere?.nom?.toLowerCase().includes(term) ?? false) ||
      (c.niveau?.libelle?.toLowerCase().includes(term) ?? false)
    );
  }

  onSearchChange(): void {
    this.applyFilter();
    this.page = 1;
  }

  get pagedClasses(): Classe[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredClasses.slice(start, start + this.pageSize);
  }

  /* ========================== CRUD ========================== */
  save(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const { code, filiereId, niveauId, active } = this.form.value;
    const filiere = this.filieres.find(f => f.id === filiereId);
    const niveau = this.niveaux.find(n => n.id === niveauId);

    if (!filiere || !niveau) {
      alert('Filière ou niveau invalide');
      this.loading = false;
      return;
    }

    const payload: Classe = {
      code,
      active,
      filiere: { id: filiere.id } as any,
      niveau: { id: niveau.id } as any,
      matiere: null
    };

    const action$ = this.editingId
      ? this.classeService.modifier(this.editingId, payload)
      : this.classeService.creer(payload);

    action$.subscribe({
      next: () => { this.resetForm(); this.loadClasses(); },
      error: (err: HttpErrorResponse) => { console.error('Erreur backend', err); },
      complete: () => this.loading = false
    });
  }

  edit(c: Classe): void {
    this.editingId = c.id!;
    this.form.patchValue({
      code: c.code,
      filiereId: c.filiere?.id ?? null,
      niveauId: c.niveau?.id ?? null,
      active: c.active
    });
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  desactiverClasse(id: number): void {
    if (!confirm('Désactiver cette classe ?')) return;
    this.classeService.desactiver(id).subscribe(() => this.loadClasses());
  }

  resetForm(): void {
    this.form.reset({ active: true });
    this.editingId = null;
    this.loading = false;
  }

  /* ========================== EXPORT ========================== */
  exportExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredClasses.map(c => ({
      Code: c.code,
      Filiere: c.filiere?.nom,
      Niveau: c.niveau?.libelle,
      Active: c.active ? 'Oui' : 'Non'
    })));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Classes');
    XLSX.writeFile(wb, 'classes.xlsx');
  }

  exportCSV(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredClasses.map(c => ({
      Code: c.code,
      Filiere: c.filiere?.nom,
      Niveau: c.niveau?.libelle,
      Active: c.active ? 'Oui' : 'Non'
    })));
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'classes.csv');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const rows = this.filteredClasses.map(c => [
      c.code,
      c.filiere?.nom,
      c.niveau?.libelle,
      c.active ? 'Oui' : 'Non'
    ]);
    (doc as any).autoTable({
      head: [['Code', 'Filière', 'Niveau', 'Actif']],
      body: rows
    });
    doc.save('classes.pdf');
  }

  /* ========================== IMPORT ========================== */
  importFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);

      // Mapping vers Classe
      data.forEach(row => {
        const filiere = this.filieres.find(f => f.nom === row.Filiere);
        const niveau = this.niveaux.find(n => n.libelle === row.Niveau);
        if (filiere && niveau) {
          const payload: Classe = {
            code: row.Code,
            active: row.Actif === 'Oui',
            filiere: { id: filiere.id } as any,
            niveau: { id: niveau.id } as any,
            matiere: null
          };
          this.classeService.creer(payload).subscribe(() => this.loadClasses());
        }
      });
    };
    reader.readAsBinaryString(file);
  }
}
