
import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { EtudiantService } from 'src/app/services/etudiant.service';
import { FacturationService } from 'src/app/services/facturation.service';

import { Etudiant } from 'src/app/models/etudiant';
import { SituationFinanciereEtudiant } from 'src/app/models/situation-financiere-etudiant';
import { Facture } from 'src/app/models/facture';
import { Paiement } from 'src/app/models/paiement';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: number; type: ToastType; message: string; }

@Component({
  selector: 'app-situation-financiere-etudiant',
  templateUrl: './situation-financiere-etudiant.component.html',
  styleUrls: ['./situation-financiere-etudiant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SituationFinanciereEtudiantComponent implements OnInit, OnDestroy {

  etudiants: Etudiant[] = [];
  filteredEtudiants: Etudiant[] = [];
  searchEtudiant = '';

  selectedEtudiant: Etudiant | null = null;
  situation: SituationFinanciereEtudiant | null = null;
  factures: Facture[] = [];
  paiements: Paiement[] = [];

  loading        = false;
  loadingEtudiants = false;
  activeTab: 'apercu' | 'factures' | 'paiements' = 'apercu';

  private _toastId = 0;
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private etudiantService: EtudiantService,
    private facturationService: FacturationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadEtudiants(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadEtudiants(): void {
    this.loadingEtudiants = true;
    this.cdr.markForCheck();
    this.etudiantService.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loadingEtudiants = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: data => { this.etudiants = data; this.filteredEtudiants = data; this.cdr.markForCheck(); },
        error: () => this.toast('error', 'Erreur chargement des étudiants')
      });
  }

  onSearch(): void {
    const q = this.searchEtudiant.toLowerCase().trim();
    this.filteredEtudiants = this.etudiants.filter(e =>
      q === '' || e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) || (e.matricule||'').toLowerCase().includes(q)
    );
    this.cdr.markForCheck();
  }

  selectEtudiant(e: Etudiant): void {
    this.selectedEtudiant = e;
    this.situation = null;
    this.factures = [];
    this.paiements = [];
    this.activeTab = 'apercu';
    this.loading = true;
    this.cdr.markForCheck();

    // Situation financière
    this.facturationService.getSituationFinanciere(e.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: sit => { this.situation = sit; this.cdr.markForCheck(); },
        error: () => this.toast('error', 'Erreur situation financière')
      });

    // Factures
    this.facturationService.getFacturesByEtudiant(e.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: f => { this.factures = f; this.cdr.markForCheck(); },
        error: () => this.toast('error', 'Erreur chargement factures')
      });

    // Paiements
    this.facturationService.getPaiementsByEtudiant(e.id!)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: p => { this.paiements = p; this.cdr.markForCheck(); },
        error: () => this.toast('error', 'Erreur chargement paiements')
      });
  }

  setTab(tab: 'apercu' | 'factures' | 'paiements'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  get solde(): number { return (this.situation as any)?.solde ?? 0; }

  formatAmount(n: number): string { return (n ?? 0).toLocaleString('fr-FR'); }

  initiale(nom: string, prenom: string): string {
    return ((nom?.[0]||'') + (prenom?.[0]||'')).toUpperCase();
  }

  statutFactureClass(f: Facture): string {
    const s = (f as any)?.statut || '';
    if (s === 'PAYEE') return 'sfe-badge sfe-badge--success';
    if (s === 'PARTIELLE') return 'sfe-badge sfe-badge--warning';
    return 'sfe-badge sfe-badge--danger';
  }

  statutFactureLabel(f: Facture): string {
    const s = (f as any)?.statut || '';
    if (s === 'PAYEE') return '✓ Payée';
    if (s === 'PARTIELLE') return '◑ Partielle';
    return '✕ Impayée';
  }

  modePaiementIcon(mode: string): string {
    switch ((mode||'').toUpperCase()) {
      case 'ESPECE':       return 'bi-cash';
      case 'VIREMENT':     return 'bi-bank';
      case 'CARTE':        return 'bi-credit-card';
      case 'MOBILE_MONEY': return 'bi-phone';
      default:             return 'bi-wallet2';
    }
  }

  // ── Toasts ────────────────────────────────────────────────────────────────
  private toast(type: ToastType, msg: string): void {
    const id = ++this._toastId;
    this.toasts.push({ id, type, message: msg });
    this.cdr.markForCheck();
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }, 4500);
  }
  dismissToast(id: number): void { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }
  trackById(_: number, e: Etudiant) { return e.id; }
  trackByFactureId(_: number, f: Facture) { return f.id; }
  trackByPaiementId(_: number, p: Paiement) { return p.id; }
}
