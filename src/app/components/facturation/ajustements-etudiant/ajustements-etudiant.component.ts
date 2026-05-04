import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FacturationService } from '../../../services/facturation.service';
import { AjustementFinancier } from '../../../models/ajustement-financier';

@Component({
  selector: 'app-ajustements-etudiant',
  templateUrl: './ajustements-etudiant.component.html',
  styleUrls: ['./ajustements-etudiant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AjustementsEtudiantComponent implements OnInit, OnDestroy {

  // ── Données ─────────────────────────────────────────────
  ajustements: AjustementFinancier[] = [];
  ajustementsFiltres: AjustementFinancier[] = [];
  selectionne: AjustementFinancier | null = null;

  // ── UI State ────────────────────────────────────────────
  loading = false;
  saving = false;
  showModal = false;
  showConfirmDelete = false;
  idASupprimer: number | null = null;
  searchQuery = '';
  filtreType = '';
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // ── Formulaire ──────────────────────────────────────────
  form!: FormGroup;

  readonly typesAjustement = ['REMISE', 'MAJORATION', 'EXONERATION', 'CREDIT', 'DEBIT'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private facturationService: FacturationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    // TODO: Charger les données via le service quand l'API sera prête
    // this.chargerAjustements();
    this.loading = false;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Formulaire ──────────────────────────────────────────
  private initForm(): void {
    this.form = this.fb.group({
      etudiantId:  [null, [Validators.required, Validators.min(1)]],
      type:        ['REMISE', Validators.required],
      montant:     [0, [Validators.required, Validators.min(0.01)]],
      motif:       ['', [Validators.required, Validators.minLength(3)]],
      dateEffet:   [new Date().toISOString().split('T')[0]],
      approuvePar: ['']
    });
  }

  // ── CRUD ────────────────────────────────────────────────
  ouvrirModalAjout(): void {
    this.selectionne = null;
    this.form.reset({
      type: 'REMISE',
      dateEffet: new Date().toISOString().split('T')[0],
      montant: 0
    });
    this.showModal = true;
    this.cdr.markForCheck();
  }

  ouvrirModalEdit(a: AjustementFinancier): void {
    this.selectionne = a;
    this.form.patchValue({
      etudiantId: a.etudiantId,
      type: a.type,
      montant: a.montant,
      motif: a.motif || '',
      dateEffet: a.dateEffet,
      approuvePar: a.approuvePar || ''
    });
    this.showModal = true;
    this.cdr.markForCheck();
  }

  fermerModal(): void {
    this.showModal = false;
    this.selectionne = null;
    this.form.reset();
    this.cdr.markForCheck();
  }

  sauvegarder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const payload = this.form.value as AjustementFinancier;

    this.facturationService.appliquerAjustement(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showToast('Ajustement appliqué avec succès !', 'success');
          this.fermerModal();
          // this.chargerAjustements(); // à décommenter quand l'API sera prête
          this.saving = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.showToast('Erreur : ' + (err.message || err), 'error');
          this.saving = false;
          this.cdr.markForCheck();
        }
      });
  }

  demanderSuppression(id: number): void {
    this.idASupprimer = id;
    this.showConfirmDelete = true;
    this.cdr.markForCheck();
  }

  confirmerSuppression(): void {
    // API non implémentée pour le moment
    this.showToast('Suppression non implémentée côté backend', 'error');
    this.showConfirmDelete = false;
    this.idASupprimer = null;
    this.cdr.markForCheck();
  }

  annulerSuppression(): void {
    this.showConfirmDelete = false;
    this.idASupprimer = null;
    this.cdr.markForCheck();
  }

  // ── Filtrage ────────────────────────────────────────────
  filtrer(): void {
    let res = [...this.ajustements];

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      res = res.filter(a =>
        (a.motif || '').toLowerCase().includes(q) ||
        String(a.etudiantId).includes(q) ||
        (a.type || '').toLowerCase().includes(q)
      );
    }

    if (this.filtreType) {
      res = res.filter(a => a.type === this.filtreType);
    }

    this.ajustementsFiltres = res;
    this.cdr.markForCheck();
  }

  // ── Export ──────────────────────────────────────────────
  exporterCSV(): void {
    const header = 'Etudiant ID,Type,Montant,Motif,Date Effet,Approuvé par';
    const rows = this.ajustementsFiltres.map(a =>
      `${a.etudiantId},"${a.type}",${a.montant},"${a.motif || ''}","${a.dateEffet ?? ''}","${a.approuvePar ?? ''}"`
    );

    this.telecharger([header, ...rows].join('\n'), 'ajustements_etudiants.csv', 'text/csv');
  }

  exporterExcel(): void {
    this.showToast('Export Excel non implémenté (SheetJS à intégrer)', 'error');
  }

  imprimerPDF(): void {
    window.print();
  }

  onImportFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.showToast(`Fichier "${file.name}" sélectionné. Parser à implémenter.`, 'success');
    }
  }

  // ── Helpers ─────────────────────────────────────────────
  private telecharger(contenu: string, nom: string, type: string): void {
    const blob = new Blob([contenu], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nom;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    this.cdr.markForCheck();

    setTimeout(() => {
      this.toast = null;
      this.cdr.markForCheck();
    }, 4000);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control.touched || control.dirty));
  }

  typeClass(type: string): string {
    const mapping: Record<string, string> = {
      REMISE: 'pill--green',
      EXONERATION: 'pill--green',
      CREDIT: 'pill--green',
      MAJORATION: 'pill--red',
      DEBIT: 'pill--red'
    };
    return mapping[type] ?? 'pill--gray';
  }

  // ── Getters ─────────────────────────────────────────────
  get totalMontant(): number {
    return this.ajustementsFiltres.reduce((sum, a) => sum + (a.montant ?? 0), 0);
  }

  // ── TrackBy ─────────────────────────────────────────────
  trackById(_: number, item: AjustementFinancier): number | undefined {
    return item.id;
  }
}
