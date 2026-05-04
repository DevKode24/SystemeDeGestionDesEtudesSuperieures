import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Etudiant } from 'src/app/models/etudiant';
import { Facture } from 'src/app/models/facture';
import { EcheancierPaiement } from 'src/app/models/echeancier-paiement';
import { EcheanceDetail } from 'src/app/models/echeance-detail';
import { Paiement } from 'src/app/models/paiement';
import { CreatePaiementDto } from 'src/app/models/create-paiement-dto';

import { EtudiantService } from 'src/app/services/etudiant.service';
import { FacturationService } from 'src/app/services/facturation.service';
import { PaiementService } from 'src/app/services/paiement.service';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface PreviewRecu {
  date: Date;
  etudiant: string;
  matricule: string;
  facture: string;
  montant: number;
  mode: string;
  reference: string;
  echeancesSelectionnees: EcheanceDetail[];
}

@Component({
  selector: 'app-echeanciers-paiement',
  templateUrl: './echeanciers-paiement.component.html',
  styleUrls: ['./echeanciers-paiement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaiementsEtudiantComponent implements OnInit, OnDestroy {

  etudiants: Etudiant[] = [];
  factures: Facture[] = [];
  echeanciers: EcheancierPaiement[] = [];
  paiements: Paiement[] = [];
  paiementsFiltres: Paiement[] = [];

  selectedEtudiant?: Etudiant;
  selectedFacture?: Facture;
  selectedEcheancier?: EcheancierPaiement;

  soldeRestant: number | null = null;

  paiementForm!: FormGroup;
  showPreview = false;
  previewRecu: PreviewRecu | null = null;
  recherchePaiement: string = '';

  modesDisponibles = [
    { value: 'ESPECE', label: 'Espèce', icon: 'bi-cash' },
    { value: 'VIREMENT', label: 'Virement', icon: 'bi-bank' },
    { value: 'CARTE', label: 'Carte', icon: 'bi-credit-card' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'bi-phone' },
  ];

  private _toastId = 0;
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private etudiantService: EtudiantService,
    private facturationService: FacturationService,
    private paiementService: PaiementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEtudiants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.paiementForm = this.fb.group({
      etudiantId: [null, Validators.required],
      factureId: [null, Validators.required],
      montant: [0, [Validators.required, Validators.min(1)]],
      modePaiement: ['ESPECE', Validators.required],
      referenceTransaction: ['', Validators.required],
      echeancesSelectionnees: [[] as number[], Validators.required]
    });
  }

  loadEtudiants(): void {
    this.etudiantService.getAll().subscribe(data => {
      this.etudiants = data;
      this.cdr.markForCheck();
    });
  }

  onSelectEtudiant(): void {
    const id = this.paiementForm.value.etudiantId;
    this.selectedEtudiant = this.etudiants.find(e => e.id === +id);

    this.resetSelections();

    if (!id) return;

    this.facturationService.getFacturesByEtudiant(id).subscribe(data => {
      this.factures = data;
      this.cdr.markForCheck();
    });

    this.facturationService.getEcheanciersByEtudiant(id).subscribe(data => {
      this.echeanciers = data;
      this.cdr.markForCheck();
    });

    this.loadPaiementsEtudiant(id);
  }

  onSelectFacture(): void {
    const factureId = this.paiementForm.value.factureId;
    this.selectedFacture = this.factures.find(f => f.id === +factureId);

    if (this.selectedFacture) {
      this.facturationService.getEcheanciersByFacture(this.selectedFacture.id!).subscribe({
        next: (data) => {
          this.selectedEcheancier = data.length > 0 ? data[0] : undefined;
          this.paiementForm.patchValue({ echeancesSelectionnees: [] });
          this.cdr.markForCheck();
        },
        error: () => {
          this.toast('warning', 'Aucun échéancier trouvé pour cette facture');
          this.selectedEcheancier = undefined;
        }
      });
    }
  }

  loadPaiementsEtudiant(etudiantId: number): void {
    this.facturationService.getPaiementsByEtudiant(etudiantId).subscribe(data => {
      this.paiements = data;
      this.filtrerPaiements();
      this.cdr.markForCheck();
    });

    this.facturationService.calculerSoldeEtudiant(etudiantId).subscribe({
      next: (res) => {
        this.soldeRestant = res.solde;
        this.cdr.markForCheck();
      }
    });
  }

  filtrerPaiements(): void {
    const term = this.recherchePaiement.toLowerCase();
    this.paiementsFiltres = this.paiements.filter(p =>
      (p.referenceTransaction || '').toLowerCase().includes(term) ||
      (p.etudiant?.nom || '').toLowerCase().includes(term)
    );
    this.cdr.markForCheck();
  }

  // ====================== MONTANT & ÉCHÉANCES - LOGIQUE MÉTIER ======================
  onMontantChange(): void {
    const montantSaisi = Number(this.paiementForm.value.montant) || 0;
    if (montantSaisi > 0 && this.selectedEcheancier?.echeances?.length) {
      this.autoSelectEcheances(montantSaisi);
    }
  }

  autoSelectEcheances(montantCible: number): void {
    if (!this.selectedEcheancier?.echeances?.length) return;

    let reste = montantCible;
    const selection: number[] = [];

    // Tri intelligent selon la règle métier
    const echeancesTriees = [...this.selectedEcheancier.echeances]
      .filter(e => e.statut !== 'PAYE')                    // Ignorer les déjà totalement payées
      .sort((a, b) => {
        // 1. Inscription en priorité absolue
        if (a.nature === 'INSCRIPTION' && b.nature !== 'INSCRIPTION') return -1;
        if (b.nature === 'INSCRIPTION' && a.nature !== 'INSCRIPTION') return 1;

        // 2. Ensuite par numéro d'échéance
        return a.numero - b.numero;
      });

    for (const e of echeancesTriees) {
      if (reste <= 0) break;

      const montantEcheance = e.montant || 0;

      if (montantEcheance <= reste) {
        selection.push(e.id!);
        reste -= montantEcheance;
      } else {
        break; // On ne fait pas de paiement partiel pour l'instant
      }
    }

    this.paiementForm.patchValue({
      echeancesSelectionnees: selection
    }, { emitEvent: false });

    this.cdr.markForCheck();
  }

  toggleEcheance(e: EcheanceDetail): void {
    let selected = [...(this.paiementForm.value.echeancesSelectionnees || [])];

    if (selected.includes(e.id!)) {
      selected = selected.filter(id => id !== e.id);
    } else {
      selected.push(e.id!);
    }

    this.paiementForm.patchValue({ echeancesSelectionnees: selected });
    this.calculMontantDepuisSelection();
  }

  calculMontantDepuisSelection(): void {
    if (!this.selectedEcheancier?.echeances) return;

    const selectedIds = this.paiementForm.value.echeancesSelectionnees;
    const total = this.selectedEcheancier.echeances
      .filter(e => selectedIds.includes(e.id))
      .reduce((sum, e) => sum + (e.montant || 0), 0);

    this.paiementForm.patchValue({ montant: total }, { emitEvent: false });
    this.cdr.markForCheck();
  }

  isSelected(id: number): boolean {
    return this.paiementForm.value.echeancesSelectionnees.includes(id);
  }

  isRetard(e: EcheanceDetail): boolean {
    if (e.statut === 'PAYE' || e.statut === 'PARTIEL') return false;
    return new Date(e.dateEcheance) < new Date();
  }

  getStatutLabel(e: EcheanceDetail): string {
    if (e.statut === 'PAYE') return '🟢 Payée';
    if (e.statut === 'PARTIEL') return '🟡 Partielle';
    if (this.isRetard(e)) return '🔴 En retard';
    return '🟠 En attente';
  }

  setMode(mode: string): void {
    this.paiementForm.patchValue({ modePaiement: mode });
    this.cdr.markForCheck();
  }

  getModeLabel(mode: string): string {
    const found = this.modesDisponibles.find(m => m.value === mode);
    return found ? found.label : mode;
  }

  // ====================== PRÉVISUALISATION & ENREGISTREMENT ======================
  previewPaiement(): void {
    if (this.paiementForm.invalid || !this.selectedEtudiant || !this.selectedEcheancier) {
      this.toast('error', 'Veuillez compléter tous les champs obligatoires');
      return;
    }

    const selectedEcheances = this.selectedEcheancier.echeances?.filter(e =>
      this.paiementForm.value.echeancesSelectionnees.includes(e.id)
    ) || [];

    this.previewRecu = {
      date: new Date(),
      etudiant: `${this.selectedEtudiant.nom} ${this.selectedEtudiant.prenom}`,
      matricule: this.selectedEtudiant.matricule || '',
      facture: this.selectedFacture?.numeroFacture || '',
      montant: this.paiementForm.value.montant,
      mode: this.paiementForm.value.modePaiement,
      reference: this.paiementForm.value.referenceTransaction,
      echeancesSelectionnees: selectedEcheances
    };

    this.showPreview = true;
    this.cdr.markForCheck();
  }

  closePreview(): void {
    this.showPreview = false;
    this.previewRecu = null;
    this.cdr.markForCheck();
  }

  enregistrerPaiement(): void {
    if (!this.previewRecu) return;

    const payload: CreatePaiementDto = {
      etudiantId: this.selectedEtudiant!.id!,
      factureId: this.selectedFacture!.id!,
      montant: this.paiementForm.value.montant,
      modePaiement: this.paiementForm.value.modePaiement,
      referenceTransaction: this.paiementForm.value.referenceTransaction,
      echeancesSelectionnees: this.paiementForm.value.echeancesSelectionnees
    };

    this.facturationService.effectuerPaiement(payload).subscribe({
      next: () => {
        this.toast('success', 'Paiement enregistré avec succès !');
        this.closePreview();
        this.resetForm();
        if (this.selectedEtudiant) {
          this.loadPaiementsEtudiant(this.selectedEtudiant.id!);
        }
      },
      error: (err) => this.toast('error', err?.message || 'Erreur lors de l’enregistrement')
    });
  }

  resetForm(): void {
    this.paiementForm.reset({
      modePaiement: 'ESPECE',
      montant: 0,
      echeancesSelectionnees: []
    });
    this.selectedFacture = undefined;
    this.selectedEcheancier = undefined;
    this.soldeRestant = null;
    this.cdr.markForCheck();
  }

  resetSelections(): void {
    this.factures = [];
    this.echeanciers = [];
    this.paiements = [];
    this.paiementsFiltres = [];
    this.selectedFacture = undefined;
    this.selectedEcheancier = undefined;
    this.soldeRestant = null;
    this.paiementForm.patchValue({ factureId: null, montant: 0, echeancesSelectionnees: [] });
  }

  formatAmount(n: number): string {
    return (n || 0).toLocaleString('fr-FR');
  }

  initiale(nom: string, prenom: string): string {
    return ((nom?.[0] || '') + (prenom?.[0] || '')).toUpperCase();
  }

  private toast(type: ToastType, message: string): void {
    const id = ++this._toastId;
    this.toasts.push({ id, type, message });
    this.cdr.markForCheck();

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this.cdr.markForCheck();
    }, 4500);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  }
}
