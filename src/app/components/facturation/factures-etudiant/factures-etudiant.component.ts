import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Etudiant } from 'src/app/models/etudiant';
import { FraisAcademique } from 'src/app/models/frais-academique';
import { Facture } from 'src/app/models/facture';
import { FactureGenerationResult } from 'src/app/models/facture-generation-result';

import { EtudiantService } from 'src/app/services/etudiant.service';
import { FraisAcademiqueService } from 'src/app/services/frais-academiques.service';
import { FacturationService } from 'src/app/services/facturation.service';

@Component({
  selector: 'app-factures-etudiant',
  templateUrl: './factures-etudiant.component.html',
  styleUrls: ['./factures-etudiant.component.scss']
})
export class FacturesEtudiantComponent implements OnInit {

  // Données principales
  etudiants: Etudiant[] = [];
  selectedEtudiant?: Etudiant;

  frais: FraisAcademique[] = [];
  factures: Facture[] = [];           // Factures de l'étudiant sélectionné
  allFactures: Facture[] = [];        // Toutes les factures du système

  // États de chargement
  loading = false;
  loadingAll = false;

  // Formulaire
  form!: FormGroup;

  // Recherche & Pagination pour "Toutes les factures"
  searchTerm = '';
  page = 1;
  pageSize = 15;

  // Résultat de génération
  generationResult: FactureGenerationResult | null = null;

  constructor(
    private fb: FormBuilder,
    private etudiantService: EtudiantService,
    private fraisService: FraisAcademiqueService,
    private facturationService: FacturationService,
    private router: Router
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

  // ================== CHARGEMENT DES DONNÉES ==================

  loadEtudiants(): void {
    this.etudiantService.getAll().subscribe({
      next: (data) => this.etudiants = data,
      error: (err) => console.error('Erreur chargement étudiants', err)
    });
  }
loadAllFactures(): void {
  this.loadingAll = true;

  this.facturationService.getAllFactures().subscribe({
    next: (data) => {

      // 🔥 ENRICHISSEMENT ICI
      this.allFactures = data.map(f => {
  const etu = this.etudiants.find(e => e.id === f.etudiantId);

  return {
    ...f,
    etudiant: etu || undefined // ✅ CORRECTION ICI
  };
});

    },
    error: (err) => console.error('Erreur chargement toutes factures', err),
    complete: () => this.loadingAll = false
  });
}
  // ================== SÉLECTION ÉTUDIANT ==================

  onSelectEtudiant(): void {
    const etudiantId = this.form.get('etudiantId')?.value;
    this.selectedEtudiant = this.etudiants.find(e => e.id === +etudiantId);
    this.generationResult = null;

    if (!this.selectedEtudiant) {
      this.frais = [];
      this.factures = [];
      return;
    }

    this.loadFraisForSelectedStudent();
    this.loadFacturesForSelectedStudent();
  }

  loadFraisForSelectedStudent(): void {
    if (!this.selectedEtudiant) return;

    this.loading = true;
    this.fraisService.getFraisByFiliereNiveauAnnee(
      this.selectedEtudiant.filiereId!,
      this.selectedEtudiant.niveauId!,
      this.selectedEtudiant.anneeAcademiqueId!
    ).subscribe({
      next: (data) => this.frais = data,
      error: (err) => console.error(err),
      complete: () => this.loading = false
    });
    console.log('Données frais reçues :', this.frais);
  }

  loadFacturesForSelectedStudent(): void {
    if (!this.selectedEtudiant?.id) return;

    this.facturationService.getFacturesByEtudiant(this.selectedEtudiant.id).subscribe({
      next: (data) => this.factures = data,
      error: (err) => console.error('Erreur chargement factures étudiant', err)
    });
  }

  // ================== GÉNÉRATION DE FACTURE ==================

  genererFacture(): void {
    if (!this.selectedEtudiant?.id) return;

    this.loading = true;
    this.generationResult = null;

    this.facturationService.genererFacturePourEtudiant(this.selectedEtudiant.id).subscribe({
      next: (result: FactureGenerationResult) => {
        this.generationResult = result;

        console.log('✅ Facture générée avec succès', result);

        // Rafraîchir les données
        this.loadFacturesForSelectedStudent();
        this.loadAllFactures();

        // Message de succès
        const nbEcheances = result.echeanciers?.length || 0;
        const nbEcritures = result.ecrituresComptables?.length || 0;

        alert(`✅ Facture générée avec succès !\n\n` +
              `Numéro : ${result.facture?.numeroFacture}\n` +
              `Échéanciers : ${nbEcheances}\n` +
              `Écritures comptables : ${nbEcritures}`);

        // Redirection vers la page de détail de la facture
        if (result.facture?.id) {
          this.router.navigate(['/dashboard/facturation/factures/info', result.facture.id]);
        }
      },
      error: (err) => {
        console.error(err);
        const msg = err?.error?.message || 'Erreur lors de la génération de la facture';
        alert(`❌ ${msg}`);
      },
      complete: () => this.loading = false
    });
  }

  // ================== RECHERCHE & PAGINATION ==================

  get searchedAllFactures(): Facture[] {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) return this.allFactures;

    return this.allFactures.filter(f =>
      f.numeroFacture?.toLowerCase().includes(term) ||
      f.etudiant?.nom?.toLowerCase().includes(term) ||
      f.etudiant?.prenom?.toLowerCase().includes(term) ||
      f.etudiant?.matricule?.toLowerCase().includes(term)
    );
  }

  get totalFrais(): number {
  return this.frais.reduce((sum, f) => sum + (f.montant || 0), 0);
}
  get filteredAllFactures(): Facture[] {
    const start = (this.page - 1) * this.pageSize;
    return this.searchedAllFactures.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.searchedAllFactures.length / this.pageSize));
  }

  onSearchChange(): void {
    this.page = 1;
  }

  decrementPage(): void {
    if (this.page > 1) this.page--;
  }

  incrementPage(): void {
    if (this.page < this.totalPages) this.page++;
  }

  // ================== ACTIONS ==================

  voirFacture(id: number): void {
    this.router.navigate(['/dashboard/facturation/factures/info', id]);
  }

  imprimerFacture(id: number): void {
    // Ouvrir la page de détail dans un nouvel onglet puis imprimer
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/dashboard/facturation/factures/info', id])
    );

    const newWindow = window.open(url, '_blank');

    if (newWindow) {
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
        }, 1000); // Attendre que la page soit bien chargée
      };
    }
  }

  // ================== FORMATAGE ==================

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatAmount(amount: number | undefined): string {
    if (amount == null) return '0';
    return amount.toLocaleString('fr-FR');
  }
}