import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Etudiant } from 'src/app/models/etudiant';
import { FraisAcademique } from 'src/app/models/frais-academique';
import { Facture } from 'src/app/models/facture';

import { EtudiantService } from 'src/app/services/etudiant.service';
import { FraisAcademiqueService } from 'src/app/services/frais-academiques.service';
import { FacturationService } from 'src/app/services/facturation.service';

@Component({
  selector: 'app-factures-etudiant',
  templateUrl: './factures-etudiant.component.html',
  styleUrls: ['./factures-etudiant.component.scss']
})
export class FacturesEtudiantComponent implements OnInit {

  // ================= DATA =================
  etudiants: Etudiant[] = [];
  selectedEtudiant?: Etudiant;

  frais: FraisAcademique[] = [];
  factures: Facture[] = [];
  allFactures: Facture[] = [];

  loading = false;
  loadingAll = false;

  // ================= FORM + RECHERCHE =================
  form!: FormGroup;
  searchTerm = '';
  page = 1;
  pageSize = 10;

  constructor(
    private fb: FormBuilder,
    private etudiantService: EtudiantService,
    private fraisService: FraisAcademiqueService,
    private facturationService: FacturationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEtudiants();
    this.loadAllFactures();
  }

  initForm(): void {
    this.form = this.fb.group({
      etudiantId: [null, Validators.required]
    });
  }

  loadEtudiants(): void {
    this.etudiantService.getAll().subscribe({
      next: (data: Etudiant[]) => this.etudiants = data,
      error: (err) => console.error(err)
    });
  }

  onSelectEtudiant(): void {
    const id = this.form.value.etudiantId;
    this.selectedEtudiant = this.etudiants.find(e => e.id === +id);

    if (!this.selectedEtudiant) {
      this.frais = [];
      this.factures = [];
      return;
    }

    this.loadFrais();
    this.loadFactures();
  }

  loadFrais(): void {
    if (!this.selectedEtudiant) return;

    this.loading = true;
    this.fraisService.getFraisByFiliereNiveauAnnee(
      this.selectedEtudiant.filiereId!,
      this.selectedEtudiant.niveauId!,
      this.selectedEtudiant.anneeAcademiqueId!
    ).subscribe({
      next: (data: FraisAcademique[]) => {
        this.frais = data;
      },
      error: (err) => console.error(err),
      complete: () => this.loading = false
    });
  }

  loadFactures(): void {
    if (!this.selectedEtudiant) return;

    this.facturationService.getFacturesByEtudiant(this.selectedEtudiant.id!).subscribe({
      next: (data: Facture[]) => this.factures = data,
      error: (err) => console.error(err)
    });
  }

  // =========================== GÉNÉRER FACTURE ===========================
  genererFacture(): void {
    if (!this.selectedEtudiant) return;

    this.loading = true;
    this.facturationService.genererFacturePourEtudiant(this.selectedEtudiant.id!).subscribe({
      next: (facture: Facture) => {
        this.factures.unshift(facture);
        this.allFactures.unshift(facture);
        alert(`✅ Facture générée : ${facture.numeroFacture}`);
      },
      error: (err) => {
        alert(err?.error?.message || 'Erreur génération de facture');
      },
      complete: () => this.loading = false
    });
  }

  // =========================== ALL FACTURES (pagination + filtre) ===========================
  loadAllFactures(): void {
    this.loadingAll = true;
    this.facturationService.getAllFactures().subscribe({
      next: (data: Facture[]) => {
        this.allFactures = data;
      },
      error: (err) => console.error(err),
      complete: () => this.loadingAll = false
    });
  }

  get pagedAllFactures(): Facture[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.allFactures.slice(start, end);
  }

  get filteredAllFactures(): Facture[] {
    const term = this.searchTerm?.toLowerCase() || '';
    return this.pagedAllFactures.filter(f => {
      return f.numeroFacture.toLowerCase().includes(term)
          || f.etudiant?.nom?.toLowerCase().includes(term)
          || f.etudiant?.prenom?.toLowerCase().includes(term);
    });
  }

  onSearchChange(): void {
    // reset page à 1 dès qu’on modifie le filtre / pageSize
    this.page = 1;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // =========================== UTILS ===========================
  formatAmount(amount: number): string {
    return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  decrementPage(): void {
  this.page = Math.max(1, this.page - 1);
}
incrementPage(): void {
  this.page = this.page + 1;
}

}
