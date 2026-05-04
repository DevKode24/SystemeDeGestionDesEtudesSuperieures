
import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { EtudiantService } from 'src/app/services/etudiant.service';
import { FacturationService } from 'src/app/services/facturation.service';

import { Etudiant } from 'src/app/models/etudiant';
import { Facture } from 'src/app/models/facture';

export interface StatEtudiant {
  etudiantId: number;
  totalFacture: number;
  totalPaiement: number;
  totalAjustement: number;
  resteAPayer: number;
  statut: string;
}

export interface KpiGlobal {
  totalFacture: number;
  totalEncaisse: number;
  totalImpaye: number;
  nbFactures: number;
  nbEtudiants: number;
  tauxRecouvrement: number;
}

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: number; type: ToastType; message: string; }

@Component({
  selector: 'app-statistique-financiere-etudiant',
  templateUrl: './statistique-financiere-etudiant.component.html',
  styleUrls: ['./statistique-financiere-etudiant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatistiqueFinanciereEtudiantComponent implements OnInit, OnDestroy {

  etudiants: Etudiant[] = [];
  filteredEtudiants: Etudiant[] = [];

  selectedEtudiantId: number | null = null;
  statEtudiant: StatEtudiant | null = null;

  kpi: KpiGlobal = {
    totalFacture: 0, totalEncaisse: 0, totalImpaye: 0,
    nbFactures: 0, nbEtudiants: 0, tauxRecouvrement: 0
  };

  loadingKpi      = false;
  loadingEtudiant = false;
  searchEtudiant  = '';

  private _toastId = 0;
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private etudiantService: EtudiantService,
    private facturationService: FacturationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEtudiants();
    this.loadKpiGlobal();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadEtudiants(): void {
    this.etudiantService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: data => { this.etudiants = data; this.filteredEtudiants = data; this.cdr.markForCheck(); },
      error: () => this.toast('error', 'Erreur chargement des étudiants')
    });
  }

  loadKpiGlobal(): void {
    this.loadingKpi = true;
    this.cdr.markForCheck();
    this.facturationService.getAllFactures()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loadingKpi = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: factures => { this.calculerKpi(factures); this.cdr.markForCheck(); },
        error: () => this.toast('error', 'Erreur statistiques globales')
      });
  }

  private calculerKpi(factures: Facture[]): void {
    const totalFacture  = factures.reduce((s, f) => s + (f.montantTotal || 0), 0);
    const totalEncaisse = factures.reduce((s, f) => s + (f.montantPaye  || 0), 0);
    this.kpi = {
      totalFacture, totalEncaisse,
      totalImpaye: totalFacture - totalEncaisse,
      nbFactures: factures.length,
      nbEtudiants: new Set(factures.map(f => (f as any).etudiantId)).size,
      tauxRecouvrement: totalFacture > 0 ? Math.round((totalEncaisse / totalFacture) * 100) : 0
    };
  }

  onSelectEtudiant(id: number): void {
    this.selectedEtudiantId = id;
    this.loadStatEtudiant(id);
  }

  loadStatEtudiant(id: number): void {
    this.loadingEtudiant = true;
    this.statEtudiant = null;
    this.cdr.markForCheck();
    this.facturationService.getStatistiquesEtudiant(id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loadingEtudiant = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: stat => { this.statEtudiant = stat; this.cdr.markForCheck(); },
        error: () => this.toast('error', 'Erreur statistiques étudiant')
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

  get etudiantSelectionne(): Etudiant | undefined {
    return this.etudiants.find(e => e.id === this.selectedEtudiantId);
  }

  statutClass(s: string): string {
    switch ((s||'').toUpperCase()) {
      case 'SOLDE':   return 'sf-status--success';
      case 'PARTIEL': return 'sf-status--warning';
      case 'IMPAYE':  return 'sf-status--danger';
      default:        return 'sf-status--secondary';
    }
  }

  statutLabel(s: string): string {
    switch ((s||'').toUpperCase()) {
      case 'SOLDE':   return '✓ Soldé';
      case 'PARTIEL': return '◑ Partiel';
      case 'IMPAYE':  return '✕ Impayé';
      default:        return s || '—';
    }
  }

  formatAmount(n: number): string { return (n ?? 0).toLocaleString('fr-FR'); }

  pourcentagePaye(stat: StatEtudiant): number {
    if (!stat.totalFacture) return 0;
    return Math.min(100, Math.round((stat.totalPaiement / stat.totalFacture) * 100));
  }

  initiale(nom: string, prenom: string): string {
    return ((nom?.[0] || '') + (prenom?.[0] || '')).toUpperCase();
  }

  private toast(type: ToastType, msg: string): void {
    const id = ++this._toastId;
    this.toasts.push({ id, type, message: msg });
    this.cdr.markForCheck();
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }, 4500);
  }

  dismissToast(id: number): void { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }
  trackById(_: number, e: Etudiant) { return e.id; }
}
