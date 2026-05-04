import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { EcritureComptable } from 'src/app/models/ecriture-comptable';
import { JournalComptableService } from 'src/app/services/journal-comptable.service';

@Component({
  selector: 'app-journal-comptable',
  templateUrl: './journal-comptable.component.html',
  styleUrls: ['./journal-comptable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JournalComptableComponent implements OnInit, OnDestroy {
  ecritures: EcritureComptable[] = [];
  ecrituresFiltrees: EcritureComptable[] = [];
  selectionne: EcritureComptable | null = null;

  loading = false;
  saving = false;
  showModal = false;
  showConfirm = false;
  idASupprimer: number | null = null;
  searchQuery = '';
  dateDebut = '';
  dateFin = '';
  filtreType = '';
  toast: { message: string; type: 'success' | 'error' } | null = null;

  readonly typesOperation = ['PAIEMENT', 'REMISE', 'MAJORATION', 'FACTURE', 'ANNULATION', 'CREDIT', 'DEBIT'];

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private journalComptableService: JournalComptableService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEcritures();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.form = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      libelle: ['', Validators.required],
      debit: [0, Validators.min(0)],
      credit: [0, Validators.min(0)],
      compte: ['', Validators.required],
      typeOperation: ['PAIEMENT', Validators.required],
      etudiantId: [null],
      reference: ['']
    });
  }

  loadEcritures(): void {
    this.loading = true;
    this.journalComptableService.getAllEcritures()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.ecritures = data;
          this.filtrer();
        },
        error: () => this.showToast('Erreur chargement du journal comptable', 'error')
      });
  }

  ouvrirModalAjout(): void {
    this.selectionne = null;
    this.form.reset({
      date: new Date().toISOString().split('T')[0],
      libelle: '',
      debit: 0,
      credit: 0,
      compte: '',
      typeOperation: 'PAIEMENT',
      etudiantId: null,
      reference: ''
    });
    this.showModal = true;
    this.cdr.markForCheck();
  }

  ouvrirModalEdit(e: EcritureComptable): void {
    this.selectionne = e;
    this.form.patchValue(e);
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

    const raw = this.form.getRawValue();
    const payload: EcritureComptable = {
      ...raw,
      debit: Number(raw.debit || 0),
      credit: Number(raw.credit || 0),
      solde: Number(raw.credit || 0) - Number(raw.debit || 0),
      etudiantId: raw.etudiantId ? Number(raw.etudiantId) : undefined,
      reference: raw.reference?.trim() || undefined,
      libelle: raw.libelle?.trim(),
      compte: raw.compte?.trim()
    };

    const request$ = this.selectionne?.id
      ? this.journalComptableService.updateEcriture(this.selectionne.id, payload)
      : this.journalComptableService.createEcriture(payload);

    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.showToast(this.selectionne ? 'Écriture modifiée !' : 'Écriture enregistrée !', 'success');
          this.fermerModal();
          this.loadEcritures();
        },
        error: () => this.showToast('Erreur lors de l’enregistrement', 'error')
      });
  }

  demanderSuppression(id: number): void {
    this.idASupprimer = id;
    this.showConfirm = true;
    this.cdr.markForCheck();
  }

  confirmerSuppression(): void {
    if (this.idASupprimer == null) return;

    this.journalComptableService.deleteEcriture(this.idASupprimer)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showToast('Écriture supprimée !', 'success');
          this.showConfirm = false;
          this.idASupprimer = null;
          this.loadEcritures();
        },
        error: () => this.showToast('Erreur lors de la suppression', 'error')
      });
  }

  annulerSuppression(): void {
    this.showConfirm = false;
    this.idASupprimer = null;
    this.cdr.markForCheck();
  }

  filtrer(): void {
    let res = [...this.ecritures];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      res = res.filter(e =>
        e.libelle?.toLowerCase().includes(q) ||
        e.compte?.toLowerCase().includes(q) ||
        e.reference?.toLowerCase().includes(q)
      );
    }

    if (this.filtreType) {
      res = res.filter(e => e.typeOperation === this.filtreType);
    }

    if (this.dateDebut) {
      res = res.filter(e => e.date >= this.dateDebut);
    }

    if (this.dateFin) {
      res = res.filter(e => e.date <= this.dateFin);
    }

    this.ecrituresFiltrees = res;
    this.cdr.markForCheck();
  }

  exporterCSV(): void {
    const h = 'Date,Libellé,Débit,Crédit,Compte,Type,Ref';
    const r = this.ecrituresFiltrees.map(e =>
      `"${e.date}","${e.libelle}",${e.debit},${e.credit},"${e.compte}","${e.typeOperation}","${e.reference ?? ''}"`
    );
    this.telecharger([h, ...r].join('\n'), 'journal_comptable.csv', 'text/csv');
  }

  exporterExcel(): void {
    this.showToast('Export Excel : brancher SheetJS', 'error');
  }

  imprimerPDF(): void {
    window.print();
  }

  onImportFile(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) {
      this.showToast(`Import "${f.name}"`, 'success');
    }
  }

  private telecharger(c: string, n: string, t: string): void {
    const b = new Blob([c], { type: t });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = n;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    this.cdr.markForCheck();

    setTimeout(() => {
      this.toast = null;
      this.cdr.markForCheck();
    }, 3500);
  }

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }

  get totalDebit(): number {
    return this.ecrituresFiltrees.reduce((s, e) => s + (e.debit ?? 0), 0);
  }

  get totalCredit(): number {
    return this.ecrituresFiltrees.reduce((s, e) => s + (e.credit ?? 0), 0);
  }

  get soldeGlobal(): number {
    return this.totalCredit - this.totalDebit;
  }

  typeClass(t: string): string {
    const m: Record<string, string> = {
      PAIEMENT: 'pill--green',
      FACTURE: 'pill--blue',
      REMISE: 'pill--green',
      MAJORATION: 'pill--red',
      ANNULATION: 'pill--orange',
      CREDIT: 'pill--green',
      DEBIT: 'pill--red'
    };
    return m[t] ?? 'pill--gray';
  }

  trackById(_: number, i: EcritureComptable): number | undefined {
    return i.id;
  }
}
