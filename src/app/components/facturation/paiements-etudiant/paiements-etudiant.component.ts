import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

import { Etudiant } from 'src/app/models/etudiant';
import { Facture } from 'src/app/models/facture';
import { EcheancierPaiement } from 'src/app/models/echeancier-paiement';
import { EcheanceDetail, NatureEcheance, StatutEcheance } from 'src/app/models/echeance-detail';
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

interface EcheanceGroup {
  nature: NatureEcheance;
  items: EcheanceDetail[];
}

@Component({
  selector: 'app-paiements-etudiant',
  templateUrl: './paiements-etudiant.component.html',
  styleUrls: ['./paiements-etudiant.component.scss'],
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
  resteAPayer = 0;

  echeancesAffichees: EcheanceDetail[] = [];
  echeancesGroupees: EcheanceGroup[] = [];

  paiementForm!: FormGroup;
  showPreview = false;
  previewRecu: PreviewRecu | null = null;
  recherchePaiement = '';
  today = new Date();

  modesDisponibles = [
    { value: 'ESPECE', label: 'Espèce', icon: 'bi-cash' },
    { value: 'VIREMENT', label: 'Virement', icon: 'bi-bank' },
    { value: 'CARTE', label: 'Carte', icon: 'bi-credit-card' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'bi-phone' }
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
     referenceTransaction: [''],
      echeancesSelectionnees: [[] as number[], Validators.required]
    });
  }

  initiale(nom?: string, prenom?: string): string {
    const n = (nom || '').trim().charAt(0).toUpperCase();
    const p = (prenom || '').trim().charAt(0).toUpperCase();
    return (n + p) || '?';
  }

  formatAmount(montant: number | null | undefined): string {
    if (montant == null || isNaN(montant)) return '0';
    return montant.toLocaleString('fr-FR').replace(/,/g, ' ');
  }

  getNatureLabel(nature: NatureEcheance): string {
    if (nature === 'INSCRIPTION') return 'Inscription';
    if (nature === 'TRANCHE_SCOLARITE') return 'Tranche de scolarité';
    return 'Annexe';
  }

  getProgressPercent(e: EcheanceDetail): number {
    const montant = e.montant || 0;
    const paye = e.montantPaye || 0;
    return montant > 0 ? Math.min(100, Math.round((paye / montant) * 100)) : 0;
  }

  getStatutLabel(e: EcheanceDetail): string {
    if (e.statut === 'PAYE') return '🟢 Payée';
    if (e.statut === 'PARTIEL') return '🟡 Partielle';
    if (this.isRetard(e)) return '🔴 En retard';
    return '🟠 En attente';
  }

  isRetard(e: EcheanceDetail): boolean {
    if (e.statut === 'PAYE') return false;
    return new Date(e.dateEcheance) < new Date();
  }

  private getPrioriteNature(nature: NatureEcheance): number {
    if (nature === 'INSCRIPTION') return 1;
    if (nature === 'TRANCHE_SCOLARITE') return 2;
    return 3;
  }

  private regroupEcheances(): void {
  this.echeancesGroupees = [
    {
      nature: 'INSCRIPTION' as NatureEcheance,
      items: this.echeancesAffichees.filter(e => e.nature === 'INSCRIPTION')
    },
    {
      nature: 'TRANCHE_SCOLARITE' as NatureEcheance,
      items: this.echeancesAffichees.filter(e => e.nature === 'TRANCHE_SCOLARITE')
    },
    {
      nature: 'ANNEXE' as NatureEcheance,
      items: this.echeancesAffichees.filter(e => e.nature === 'ANNEXE')
    }
  ].filter(g => g.items.length > 0) as EcheanceGroup[];
}
  private buildEcheancesAffichage(): void {
    const list = [...(this.selectedEcheancier?.echeances || [])];

    this.echeancesAffichees = list.sort((a, b) => {
      const pa = this.getPrioriteNature(a.nature);
      const pb = this.getPrioriteNature(b.nature);
      if (pa !== pb) return pa - pb;
      return a.numero - b.numero;
    });

   this.regroupEcheances();
  }

  private recomputeStates(): void {
    const facture = this.selectedFacture;
    const echeances = this.selectedEcheancier?.echeances || [];
    const montantSaisi = Number(this.paiementForm.value.montant) || 0;
    const montantDejaPaye = facture?.montantPaye || 0;

    this.resteAPayer = Math.max((facture?.montantTotal || 0) - montantDejaPaye, 0);
    this.soldeRestant = Math.max(this.resteAPayer - montantSaisi, 0);

    this.buildEcheancesAffichage();

    let disponible = montantDejaPaye + montantSaisi;

    this.echeancesAffichees = this.echeancesAffichees.map(e => {
      const montant = e.montant || 0;
      const deja = e.montantPaye || 0;
      const reste = Math.max(montant - deja, 0);

      let applique = 0;
      if (disponible > 0 && reste > 0) {
        applique = Math.min(disponible, reste);
        disponible -= applique;
      }

      const montantPaye = deja + applique;

      let statut: StatutEcheance = 'EN_ATTENTE';
      if (montantPaye >= montant) statut = 'PAYE';
      else if (montantPaye > 0) statut = 'PARTIEL';

      return { ...e, montantPaye, statut };
    });

    this.regroupEcheances();

    this.cdr.markForCheck();
  }

  private generateReference(): string {
  if (!this.selectedFacture) return '';

  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');

  const facture = this.selectedFacture.numeroFacture || 'FAC';

  const mode = this.paiementForm.value.modePaiement || 'NA';

  const echeancesIds: number[] = this.paiementForm.value.echeancesSelectionnees || [];

  const echeancesPart = echeancesIds.length
    ? 'E' + echeancesIds.join('E')
    : 'E0';

  return `${dateStr}-${facture}-${mode}-${echeancesPart}`;
}
private updateReference(): void {
  const ref = this.generateReference();
  this.paiementForm.patchValue(
    { referenceTransaction: ref },
    { emitEvent: false }
  );
}
  private toast(type: ToastType, message: string): void {
    const t: Toast = { id: ++this._toastId, type, message };
    this.toasts.push(t);
    this.cdr.markForCheck();
    setTimeout(() => this.dismissToast(t.id), 5000);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  }

  resetSelections(): void {
    this.selectedFacture = undefined;
    this.selectedEcheancier = undefined;
    this.soldeRestant = null;
    this.resteAPayer = 0;
    this.echeancesAffichees = [];
    this.echeancesGroupees = [];
    this.showPreview = false;
    this.previewRecu = null;
    this.paiementForm.patchValue({
      factureId: null,
      montant: 0,
      echeancesSelectionnees: []
    });
    this.cdr.markForCheck();
  }

  loadEtudiants(): void {
    this.etudiantService.getAll().subscribe(data => {
      this.etudiants = data;
      this.cdr.markForCheck();
    });
  }

  onSelectEtudiant(): void {
    const id = Number(this.paiementForm.value.etudiantId);
    this.selectedEtudiant = this.etudiants.find(e => e.id === id);
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
    const factureId = Number(this.paiementForm.value.factureId);
    this.selectedFacture = this.factures.find(f => f.id === factureId);
    this.selectedEcheancier = undefined;
    this.echeancesAffichees = [];
    this.echeancesGroupees = [];

    if (!this.selectedFacture) {
      this.cdr.markForCheck();
      return;
    }

    this.facturationService.getEcheanciersByFacture(this.selectedFacture.id).subscribe({
      next: (data) => {
        this.selectedEcheancier = data?.[0];
        this.paiementForm.patchValue({ echeancesSelectionnees: [] });
        this.recomputeStates();
        this.updateReference();
      },
      error: () => {
        this.toast('warning', 'Aucun échéancier trouvé pour cette facture');
        this.recomputeStates();
      }
    });
  }

  loadPaiementsEtudiant(etudiantId: number): void {
    this.facturationService.getPaiementsByEtudiant(etudiantId).subscribe(data => {
      this.paiements = data;
      this.filtrerPaiements();
      this.recomputeStates();
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
      (p.etudiant?.nom || '').toLowerCase().includes(term) ||
      (p.facture?.numeroFacture || '').toLowerCase().includes(term)
    );
    this.cdr.markForCheck();
  }

  onMontantChange(): void {
    const montant = Number(this.paiementForm.value.montant) || 0;
    if (montant > 0 && this.selectedEcheancier?.echeances?.length) {
      this.autoSelectEcheances(montant);
    }
    this.recomputeStates();
    this.updateReference();
  }

  autoSelectEcheances(montantCible: number): void {
    const echeances = [...(this.selectedEcheancier?.echeances || [])]
      .sort((a, b) => {
        const pa = this.getPrioriteNature(a.nature);
        const pb = this.getPrioriteNature(b.nature);
        if (pa !== pb) return pa - pb;
        return a.numero - b.numero;
      });

    let reste = montantCible;
    const selection: number[] = [];

    for (const e of echeances) {
      const besoin = Math.max((e.montant || 0) - (e.montantPaye || 0), 0);
      if (besoin <= 0) continue;

      if (reste >= besoin) {
        selection.push(e.id!);
        reste -= besoin;
      } else {
        break;
      }
    }

    this.paiementForm.patchValue({ echeancesSelectionnees: selection }, { emitEvent: false });
    this.cdr.markForCheck();
  }

  toggleEcheance(e: EcheanceDetail): void {
    if (e.statut === 'PAYE') return;

    let selected = [...(this.paiementForm.value.echeancesSelectionnees || [])];
    if (selected.includes(e.id!)) {
      selected = selected.filter(id => id !== e.id);
    } else {
      selected.push(e.id!);
    }

    this.paiementForm.patchValue({ echeancesSelectionnees: selected });
    
  this.calculMontantDepuisSelection();
  this.updateReference(); 
  }

  calculMontantDepuisSelection(): void {
    if (!this.selectedEcheancier?.echeances) return;

    const ids = this.paiementForm.value.echeancesSelectionnees || [];
    const total = this.selectedEcheancier.echeances
      .filter(e => ids.includes(e.id))
      .reduce((sum, e) => sum + (e.montant || 0), 0);

    this.paiementForm.patchValue({ montant: total }, { emitEvent: false });
    this.recomputeStates();
  }

  isSelected(id: number): boolean {
    return (this.paiementForm.value.echeancesSelectionnees || []).includes(id);
  }

  setMode(mode: string): void {
    this.paiementForm.patchValue({ modePaiement: mode });
    this.updateReference();
    this.cdr.markForCheck();

  }

  getModeLabel(mode: string): string {
    const m = this.modesDisponibles.find(x => x.value === mode);
    return m ? m.label : mode;
  }

  previewPaiement(): void {
    if (this.paiementForm.invalid || !this.selectedEtudiant || !this.selectedFacture) {
      this.toast('error', 'Veuillez remplir correctement le formulaire');
      return;
    }

    const formValue = this.paiementForm.value;
    const selectedEcheances = this.echeancesAffichees.filter(e =>
      (formValue.echeancesSelectionnees || []).includes(e.id)
    );

    this.previewRecu = {
      date: new Date(),
      etudiant: `${this.selectedEtudiant.nom} ${this.selectedEtudiant.prenom}`,
      matricule: this.selectedEtudiant.matricule || '',
      facture: this.selectedFacture.numeroFacture || '',
      montant: formValue.montant,
      mode: formValue.modePaiement,
      reference: formValue.referenceTransaction,
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
  if (this.paiementForm.invalid || !this.selectedEtudiant || !this.selectedFacture) {
    this.toast('error', 'Formulaire incomplet');
    return;
  }

  this.updateReference();

  const dto: CreatePaiementDto = {
    etudiantId: this.selectedEtudiant.id!,
    factureId: Number(this.paiementForm.get('factureId')!.value),
    montant: Number(this.paiementForm.get('montant')!.value),
    modePaiement: this.paiementForm.get('modePaiement')!.value,
    referenceTransaction: this.paiementForm.get('referenceTransaction')!.value,
    echeancesSelectionnees: this.paiementForm.get('echeancesSelectionnees')!.value || []
  };

  this.facturationService.effectuerPaiement(dto).subscribe({
    next: (paiement) => {
      this.toast('success', 'Paiement enregistré avec succès ✓');
      this.openRecuPdf(paiement.id!);
      this.closePreview();
      this.resetSelections();
      if (this.selectedEtudiant?.id) {
        this.onSelectEtudiant();
      }
    },
    error: (err: any) => {
      const msg = err?.error?.message || err?.message || 'Erreur lors de l’enregistrement du paiement';
      this.toast('error', msg);
    }
  });
}

openRecuPdf(paiementId: number): void {
  this.paiementService.getRecuPdf(paiementId).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    },
    error: () => {
      this.toast('warning', 'Paiement enregistré, mais le reçu PDF n’a pas pu être ouvert');
    }
  });
}
}