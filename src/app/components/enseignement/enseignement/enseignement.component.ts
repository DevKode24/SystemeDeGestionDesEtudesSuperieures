import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Enseignement } from 'src/app/models/enseignement';
import { Classe } from 'src/app/models/classe';
import { Matiere } from 'src/app/models/matiere';
import { Enseignant } from 'src/app/models/enseignant';
import { AnneeAcademique } from 'src/app/models/annee-academique';

import { EnseignementService } from 'src/app/services/enseignement.service';
import { ClasseService } from 'src/app/services/classe.service';
import { MatiereService } from 'src/app/services/matiere.service';
import { EnseignantService } from 'src/app/services/enseignant.service';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-enseignement',
  templateUrl: './enseignement.component.html',
  styleUrls: ['./enseignement.component.scss']
})
export class EnseignementComponent implements OnInit {

  form!: FormGroup;
  enseignements: Enseignement[] = [];
  filteredEnseignements: Enseignement[] = [];

  classes: Classe[] = [];
  matieres: Matiere[] = [];
  enseignants: Enseignant[] = [];
  annees: AnneeAcademique[] = [];

  editingId?: number;
  loading = false;

  // filtres
  filterClasse = '';
  filterMatiere = '';
  filterEnseignant = '';
  filterAnnee = '';

  // pagination
  page = 1;
  pageSize = 5;

  constructor(
    private fb: FormBuilder,
    private enseignementService: EnseignementService,
    private classeService: ClasseService,
    private matiereService: MatiereService,
    private enseignantService: EnseignantService,
    private anneeService: AnneeAcademiqueService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadOptions();
    this.loadReferentiels();
}
loadReferentiels(): void {
  forkJoin({
    matieres: this.matiereService.getAll(),
    classes: this.classeService.getAll(),
    enseignants: this.enseignantService.getAll(),
    annees: this.anneeService.getAll()
  }).subscribe(res => {
    this.matieres = res.matieres;
    this.classes = res.classes;
    this.enseignants = res.enseignants;
    this.annees = res.annees;

    // 🔥 UNE FOIS TOUT CHARGÉ
    this.loadEnseignements();
  });
}

  initForm(): void {
    this.form = this.fb.group({
      matiereId: [null, Validators.required],
      classeId: [null, Validators.required],
      enseignantId: [null, Validators.required],
      anneeAcademiqueId: [null, Validators.required],
      actif: [true]
    });
  }

  loadOptions(): void {
    this.classeService.getAll().subscribe(c => { this.classes = c; this.loadEnseignements(); });
    this.matiereService.getAll().subscribe(m => this.matieres = m);
    this.enseignantService.getAll().subscribe(e => this.enseignants = e);
    this.anneeService.getAll().subscribe(a => this.annees = a);
  }

 loadEnseignements(): void {
  this.enseignementService.getAll().subscribe(data => {

    this.enseignements = data.map(e => ({
      ...e,
      matiereIntitule:
        this.matieres.find(m => m.id === e.matiereId)?.intitule ?? '',
      classeCode:
        this.classes.find(c => c.id === e.classeId)?.code ?? '',
      enseignantNom: (() => {
        const ens = this.enseignants.find(p => p.id === e.enseignantId);
        return ens ? `${ens.nom} ${ens.prenom}` : '';
      })(),
      anneeAcademiqueLibelle:
        this.annees.find(a => a.id === e.anneeAcademiqueId)?.libelle ?? ''
    }));

    // ✅ IMPORTANT
    this.filteredEnseignements = [...this.enseignements];
  });
}

  save(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const payload: Enseignement = this.form.value;

    const action$ = this.editingId
      ? this.enseignementService.modifier(this.editingId, payload)
      : this.enseignementService.creer(payload);

    action$.subscribe({
      next: () => { this.resetForm(); this.loadEnseignements(); },
      error: (err: HttpErrorResponse) => console.error('Erreur backend', err),
      complete: () => this.loading = false
    });
  }

  edit(e: Enseignement): void {
    this.editingId = e.id;
    this.form.patchValue(e);
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  desactiver(id: number): void {
    if (!confirm('Désactiver cet enseignement ?')) return;
    this.enseignementService.desactiver(id).subscribe(() => this.loadEnseignements());
  }

  resetForm(): void {
    this.form.reset({ actif: true });
    this.editingId = undefined;
    this.loading = false;
  }

  applyFilters(): void {
  const termClasse = this.filterClasse.toLowerCase();
  const termMatiere = this.filterMatiere.toLowerCase();
  const termEnseignant = this.filterEnseignant.toLowerCase();
  const termAnnee = this.filterAnnee.toLowerCase();

  this.filteredEnseignements = this.enseignements.filter(e => 
    (e.classeCode ?? '').toLowerCase().includes(termClasse) &&
    (e.matiereIntitule ?? '').toLowerCase().includes(termMatiere) &&
    (e.enseignantNom ?? '').toLowerCase().includes(termEnseignant) &&
    (e.anneeAcademiqueLibelle ?? '').toLowerCase().includes(termAnnee)
  );
}


  onSearchChange(): void {
    this.applyFilters();
    this.page = 1;
  }

  get pagedEnseignements(): Enseignement[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredEnseignements.slice(start, start + this.pageSize);
  }

  /* ========================== EXPORT ========================== */
  exportExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredEnseignements.map(e => ({
      Matiere: e.matiereIntitule,
      Classe: e.classeCode,
      Enseignant: e.enseignantNom,
      Annee: e.anneeAcademiqueLibelle,
      Actif: e.actif ? 'Oui' : 'Non'
    })));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Enseignements');
    XLSX.writeFile(wb, 'enseignements.xlsx');
  }

  exportCSV(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredEnseignements.map(e => ({
      Matiere: e.matiereIntitule,
      Classe: e.classeCode,
      Enseignant: e.enseignantNom,
      Annee: e.anneeAcademiqueLibelle,
      Actif: e.actif ? 'Oui' : 'Non'
    })));
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'enseignements.csv');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const rows = this.filteredEnseignements.map(e => [
      e.matiereIntitule,
      e.classeCode,
      e.enseignantNom,
      e.anneeAcademiqueLibelle,
      e.actif ? 'Oui' : 'Non'
    ]);
    (doc as any).autoTable({
      head: [['Matière', 'Classe', 'Enseignant', 'Année', 'Actif']],
      body: rows
    });
    doc.save('enseignements.pdf');
  }

/* ========================= IMPORT ========================= */
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

      data.forEach(row => {
        const payload: Enseignement = {
          matiereId: this.matieres.find(m => m.intitule === row.Matiere)?.id ?? 0,
          classeId: this.classes.find(c => c.code === row.Classe)?.id ?? 0,
          enseignantId: this.enseignants.find(a => a.nom === row.Enseignant)?.id ?? 0,
          anneeAcademiqueId: 1, // adapter selon votre logique
          actif: row.Actif === 'Oui'
        };
        this.enseignementService.creer(payload).subscribe(() => this.loadEnseignements());
      });
    };
    reader.readAsBinaryString(file);
  }
}
