import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Role, TokenStorageService } from 'src/app/auth/token-storage.service';
import { Ue } from 'src/app/models/ue';
import { UeService } from 'src/app/services/ue.service';
import { SemestreService } from 'src/app/services/semestre.service';
import { FiliereService } from 'src/app/services/filiere.service';
import { NiveauService } from 'src/app/services/niveau.service';

@Component({
  selector: 'app-ue',
  templateUrl: './ue.component.html',
  styleUrls: ['./ue.component.scss']
})
export class UeComponent implements OnInit {

  /* ==========================
     DONNÉES
  ========================== */
  ues: Ue[] = [];
  filteredUes: Ue[] = [];

  semestres: any[] = [];
  filieres: any[] = [];
  niveaux: any[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  searchTerm = '';
  page = 1;
  pageSize = 5;

  role: Role | Role[] | null = null;

  constructor(
    private fb: FormBuilder,
    private ueService: UeService,
    private semestreService: SemestreService,
    private filiereService: FiliereService,
    private niveauService: NiveauService,
    private tokenStorage: TokenStorageService
  ) {}

  /* ==========================
     INIT
  ========================== */
  ngOnInit(): void {
    this.role = this.tokenStorage.getUserRole();
    this.initForm();
    this.loadOptions();
    this.loadUes();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      intitule: ['', Validators.required],
      credit: [0, [Validators.required, Validators.min(1)]],
      semestreId: [null, Validators.required],
      filiereId: [null, Validators.required],
      niveauId: [null, Validators.required]
    });
  }

  loadOptions(): void {
    this.semestreService.getAll().subscribe(r => this.semestres = r);
    this.filiereService.getAll().subscribe(r => this.filieres = r);
    this.niveauService.getAll().subscribe(r => this.niveaux = r);
  }

  loadUes(): void {
    this.ueService.getAll().subscribe(data => {
      this.ues = data;
      this.applyFilter();
    });
  }

  /* ==========================
     FILTRE + PAGINATION
  ========================== */
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUes = this.ues.filter(u =>
      u.code.toLowerCase().includes(term) ||
      u.intitule.toLowerCase().includes(term)
    );
  }

  
  onSearchChange(): void {
    this.applyFilter();
    this.page = 1;
  }

  get pagedUes(): Ue[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUes.slice(start, start + this.pageSize);
  }

  /* ==========================
     CRUD
  ========================== */
  save(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const payload: Ue = { ...this.form.value };

    const action$ = this.editingId
      ? this.ueService.modifier(this.editingId, payload)
      : this.ueService.creer(payload);

    action$.subscribe({
      next: () => { this.resetForm(); this.loadUes(); },
      error: err => console.error(err),
      complete: () => this.loading = false
    });
  }

  edit(ue: Ue): void {
    this.editingId = ue.id!;
    this.form.patchValue(ue);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette UE ?')) return;
    this.ueService.supprimer(id).subscribe(() => this.loadUes());
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.loading = false;
  }

  canEdit(): boolean {
    if (!this.role) return false;
    return Array.isArray(this.role)
      ? this.role.includes(Role.Admin) || this.role.includes(Role.Scolarite)
      : this.role === Role.Admin || this.role === Role.Scolarite;
  }

  /* ==========================
     EXPORT
  ========================== */
  exportExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.filteredUes.map(u => ({
      Code: u.code,
      Intitulé: u.intitule,
      Crédits: u.credit
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'UE');
    XLSX.writeFile(wb, 'ues.xlsx');
  }

  exportCSV(): void {
    const ws = XLSX.utils.json_to_sheet(this.filteredUes);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv]), 'ues.csv');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [['Code', 'Intitulé', 'Crédits']],
      body: this.filteredUes.map(u => [u.code, u.intitule, u.credit])
    });
    doc.save('ues.pdf');
  }

  /* ==========================
     IMPORT
  ========================== */
  importFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const wb = XLSX.read(e.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(ws);

      data.forEach(row => {
        const payload: Ue = {
          code: row.Code,
          intitule: row.Intitulé,
          credit: row.Crédits,
          semestreId: row.SemestreId,
          filiereId: row.FiliereId,
          niveauId: row.NiveauId
        };
        this.ueService.creer(payload).subscribe(() => this.loadUes());
      });
    };
    reader.readAsBinaryString(file);
  }
}
