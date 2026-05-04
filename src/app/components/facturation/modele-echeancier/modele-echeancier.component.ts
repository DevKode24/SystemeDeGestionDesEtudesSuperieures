import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { ModeleEcheancier } from 'src/app/models/modele-echeancier';
import { ParametrageTypeFrais } from 'src/app/models/parametrage-type-frais';
import { EcheanceDetail } from 'src/app/models/echeance-detail';
import { NatureTypeFrais } from 'src/app/models/type-frais';
import { ParametrageTypeFraisService } from 'src/app/services/parametrage-type.service';


import { ModeleEcheancierService } from 'src/app/services/modele-echeancier.service';

type Vue = 'table' | 'grid';
type ToastType = 'success' | 'error';
type FiltreActif = '' | 'true' | 'false';

@Component({
  selector: 'app-modele-echeancier',
  templateUrl: './modele-echeancier.component.html',
  styleUrls: ['./modele-echeancier.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModeleEcheancierComponent implements OnInit, OnDestroy {
  parametrages: ParametrageTypeFrais[] = [];
  modeles: ModeleEcheancier[] = [];
  modelesFiltres: ModeleEcheancier[] = [];

  previewEcheances: EcheanceDetail[] = [];

  selectionne: ModeleEcheancier | null = null;
  detailOuvert: ModeleEcheancier | null = null;

  loading = false;
  saving = false;
  showModal = false;
  showDetail = false;
  showConfirm = false;

  idASupprimer: number | null = null;

  vue: Vue = 'table';
  page = 1;
  pageSize = 10;

  searchQuery = '';
  filtreNature = '';
  filtreActif: FiltreActif = '';

  toast: { message: string; type: ToastType } | null = null;

  readonly natures: NatureTypeFrais[] = ['INSCRIPTION', 'SCOLARITE', 'ANNEXE', 'AUTRE'];

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private modeleEcheancierService: ModeleEcheancierService,
    private parametrageTypeFraisService: ParametrageTypeFraisService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadParametrages();
    this.loadModeles();

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.genererEcheancesPreview();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filtreNature = '';
    this.filtreActif = '';
    this.filtrer();
  }

  initForm(): void {
    this.form = this.fb.group({
      parametrageTypeFraisId: [null],
      libelle: ['', [Validators.required, Validators.minLength(2)]],
      nature: ['AUTRE', Validators.required],
      montantTheorique: [null, [Validators.min(0)]],
      fractionnable: [false],
      nombreEcheances: [1, [Validators.required, Validators.min(1), Validators.max(24)]],
      periodiciteMois: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      dateDebut: [this.today(), Validators.required],
      description: [''],
      actif: [true]
    });
  }

  loadParametrages(): void {
    this.parametrageTypeFraisService.getAllParametragesTypeFrais()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.parametrages = data
            .filter(p => p.actif !== false)
            .sort((a, b) => a.libelle.localeCompare(b.libelle));
          this.cdr.markForCheck();
        },
        error: () => this.showToast('Erreur chargement des paramétrages', 'error')
      });
  }

  loadModeles(): void {
    this.loading = true;

    this.modeleEcheancierService.getAllModelesEcheancier()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.modeles = data.map(item => ({
            ...item,
            dateFin: item.dateFin || this.computeDateFin(item.echeances || []),
            echeances: item.echeances || []
          }));
          this.filtrer();
        },
        error: () => this.showToast('Erreur chargement des modèles', 'error')
      });
  }

  onSelectParametrage(): void {
    const id = Number(this.form.get('parametrageTypeFraisId')?.value);
    const selected = this.parametrages.find(p => p.id === id);

    if (!selected) return;

    this.form.patchValue({
      libelle: selected.libelle,
      nature: selected.nature,
      montantTheorique: selected.montantParDefaut ?? null,
      fractionnable: selected.fractionnable,
      nombreEcheances: selected.fractionnable ? selected.nombreTranchesDefaut : 1,
      periodiciteMois: selected.fractionnable ? selected.periodiciteMois : 1
    });
  }

  ouvrirModalAjout(): void {
    this.selectionne = null;
    this.previewEcheances = [];

    this.form.reset({
      parametrageTypeFraisId: null,
      libelle: '',
      nature: 'AUTRE',
      montantTheorique: null,
      fractionnable: false,
      nombreEcheances: 1,
      periodiciteMois: 1,
      dateDebut: this.today(),
      description: '',
      actif: true
    });

    this.showModal = true;
    this.cdr.markForCheck();
  }

  ouvrirModalEdit(modele: ModeleEcheancier): void {
    this.selectionne = modele;

    this.form.patchValue({
      parametrageTypeFraisId: modele.parametrageTypeFraisId ?? null,
      libelle: modele.libelle,
      nature: modele.nature,
      montantTheorique: modele.montantTheorique ?? null,
      fractionnable: modele.fractionnable,
      nombreEcheances: modele.nombreEcheances,
      periodiciteMois: modele.periodiciteMois,
      dateDebut: modele.dateDebut,
      description: modele.description || '',
      actif: modele.actif ?? true
    });

    this.previewEcheances = modele.echeances?.length
      ? [...modele.echeances]
      : this.genererDetailsDepuisModele(modele);

    this.showModal = true;
    this.cdr.markForCheck();
  }

  voirDetail(modele: ModeleEcheancier): void {
    this.detailOuvert = {
      ...modele,
      echeances: modele.echeances?.length ? [...modele.echeances] : this.genererDetailsDepuisModele(modele),
      dateFin: modele.dateFin || this.computeDateFin(modele.echeances || [])
    };

    this.showDetail = true;
    this.cdr.markForCheck();
  }

  fermerModal(): void {
    this.showModal = false;
    this.selectionne = null;
    this.previewEcheances = [];

    this.form.reset({
      parametrageTypeFraisId: null,
      libelle: '',
      nature: 'AUTRE',
      montantTheorique: null,
      fractionnable: false,
      nombreEcheances: 1,
      periodiciteMois: 1,
      dateDebut: this.today(),
      description: '',
      actif: true
    });

    this.cdr.markForCheck();
  }

  fermerDetail(): void {
    this.showDetail = false;
    this.detailOuvert = null;
    this.cdr.markForCheck();
  }

  sauvegarder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: ModeleEcheancier = {
      id: this.selectionne?.id,
      parametrageTypeFraisId: raw.parametrageTypeFraisId ? Number(raw.parametrageTypeFraisId) : undefined,
      libelle: raw.libelle,
      nature: raw.nature,
      montantTheorique: raw.montantTheorique != null && raw.montantTheorique !== ''
        ? Number(raw.montantTheorique)
        : undefined,
      fractionnable: !!raw.fractionnable,
      nombreEcheances: !!raw.fractionnable ? Number(raw.nombreEcheances) : 1,
      periodiciteMois: !!raw.fractionnable ? Number(raw.periodiciteMois) : 1,
      dateDebut: raw.dateDebut,
      dateFin: this.dateFinPreview,
      description: raw.description,
      actif: raw.actif,
      echeances: [...this.previewEcheances]
    };

    this.saving = true;
    this.cdr.markForCheck();

    const request$ = this.selectionne?.id
      ? this.modeleEcheancierService.updateModeleEcheancier(this.selectionne.id, payload)
      : this.modeleEcheancierService.createModeleEcheancier(payload);

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
          this.showToast(this.selectionne ? 'Modèle mis à jour !' : 'Modèle créé !', 'success');
          this.fermerModal();
          this.loadModeles();
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

    this.modeleEcheancierService.deleteModeleEcheancier(this.idASupprimer)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showToast('Modèle supprimé !', 'success');
          this.showConfirm = false;
          this.idASupprimer = null;
          this.loadModeles();
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
    let result = [...this.modeles];
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter(m =>
        m.libelle.toLowerCase().includes(q) ||
        m.nature.toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q)
      );
    }

    if (this.filtreNature) {
      result = result.filter(m => m.nature === this.filtreNature);
    }

    if (this.filtreActif !== '') {
      const isActif = this.filtreActif === 'true';
      result = result.filter(m => (m.actif ?? true) === isActif);
    }

    this.modelesFiltres = result;
    this.page = 1;
    this.cdr.markForCheck();
  }

  genererEcheancesPreview(): void {
    const value = this.form.getRawValue();
    const montant = Number(value.montantTheorique || 0);
    const dateDebut = value.dateDebut || this.today();

    if (!value.nature) {
      this.previewEcheances = [];
      return;
    }

    if (!montant) {
      this.previewEcheances = [];
      return;
    }

    if (value.nature === 'INSCRIPTION') {
      this.form.patchValue(
        { fractionnable: false, nombreEcheances: 1, periodiciteMois: 1 },
        { emitEvent: false }
      );

      this.previewEcheances = [{
        numero: 1,
        libelle: 'Inscription',
        nature: 'INSCRIPTION',
        dateEcheance: dateDebut,
        montant,
        statut: 'EN_ATTENTE'
      }];
      return;
    }

    if (value.nature === 'ANNEXE') {
      this.form.patchValue(
        { fractionnable: false, nombreEcheances: 1, periodiciteMois: 1 },
        { emitEvent: false }
      );

      this.previewEcheances = [{
        numero: 1,
        libelle: value.libelle || 'Frais annexe',
        nature: 'ANNEXE',
        dateEcheance: dateDebut,
        montant,
        statut: 'EN_ATTENTE'
      }];
      return;
    }

    if (!value.fractionnable) {
      this.form.patchValue(
        { nombreEcheances: 1, periodiciteMois: 1 },
        { emitEvent: false }
      );

      this.previewEcheances = [{
        numero: 1,
        libelle: value.libelle || 'Paiement unique',
        nature: 'TRANCHE_SCOLARITE',
        dateEcheance: dateDebut,
        montant,
        statut: 'EN_ATTENTE'
      }];
      return;
    }

    const nombre = Number(value.nombreEcheances || 1);
    const periodicite = Number(value.periodiciteMois || 1);
    const repartition = this.repartitionMontant(montant, nombre);

    this.previewEcheances = repartition.map((part, index) => ({
      numero: index + 1,
      libelle: `Tranche ${index + 1}`,
      nature: 'TRANCHE_SCOLARITE',
      dateEcheance: this.addMonths(dateDebut, index * periodicite),
      montant: part,
      statut: 'EN_ATTENTE'
    }));
  }

  private genererDetailsDepuisModele(modele: ModeleEcheancier): EcheanceDetail[] {
    const montant = Number(modele.montantTheorique || 0);
    const dateDebut = modele.dateDebut || this.today();

    if (!montant || !modele.nature) return [];

    if (modele.nature === 'INSCRIPTION') {
      return [{
        numero: 1,
        libelle: 'Inscription',
        nature: 'INSCRIPTION',
        dateEcheance: dateDebut,
        montant,
        statut: 'EN_ATTENTE'
      }];
    }

    if (modele.nature === 'ANNEXE') {
      return [{
        numero: 1,
        libelle: modele.libelle || 'Frais annexe',
        nature: 'ANNEXE',
        dateEcheance: dateDebut,
        montant,
        statut: 'EN_ATTENTE'
      }];
    }

    if (!modele.fractionnable) {
      return [{
        numero: 1,
        libelle: modele.libelle || 'Paiement unique',
        nature: 'TRANCHE_SCOLARITE',
        dateEcheance: dateDebut,
        montant,
        statut: 'EN_ATTENTE'
      }];
    }

    const repartition = this.repartitionMontant(montant, modele.nombreEcheances);

    return repartition.map((part, index) => ({
      numero: index + 1,
      libelle: `Tranche ${index + 1}`,
      nature: 'TRANCHE_SCOLARITE',
      dateEcheance: this.addMonths(dateDebut, index * modele.periodiciteMois),
      montant: part,
      statut: 'EN_ATTENTE'
    }));
  }

  repartitionMontant(total: number, n: number): number[] {
    const base = Math.floor(total / n);
    const reste = total % n;
    return Array.from({ length: n }, (_, i) => (i < reste ? base + 1 : base));
  }

  today(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  addMonths(dateStr: string, months: number): string {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  computeDateFin(echeances: EcheanceDetail[]): string {
    if (!echeances?.length) return this.today();
    return echeances[echeances.length - 1].dateEcheance;
  }

  get dateFinPreview(): string {
    return this.previewEcheances.length > 0
      ? this.previewEcheances[this.previewEcheances.length - 1].dateEcheance
      : (this.form.get('dateDebut')?.value || this.today());
  }

  get totalActifs(): number {
    return this.modelesFiltres.filter(m => m.actif !== false).length;
  }

  get totalMontant(): number {
    return this.modelesFiltres.reduce((sum, m) => sum + (m.montantTheorique || 0), 0);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.modelesFiltres.length / this.pageSize));
  }

  get paginated(): ModeleEcheancier[] {
    const start = (this.page - 1) * this.pageSize;
    return this.modelesFiltres.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    this.page = Math.max(1, Math.min(page, this.totalPages));
  }

  isVueTable(): boolean {
    return this.vue === 'table';
  }

  isVueGrid(): boolean {
    return this.vue === 'grid';
  }

  setVue(vue: Vue): void {
    this.vue = vue;
  }

  exporterCSV(): void {
    const header = 'Libelle,Nature,Montant theorique,Nombre echeances,Periodicite,Date debut,Date fin,Actif';
    const rows = this.modelesFiltres.map(m =>
      `"${m.libelle}","${m.nature}",${m.montantTheorique ?? ''},${m.nombreEcheances},${m.periodiciteMois},"${m.dateDebut}","${m.dateFin}","${m.actif !== false ? 'OUI' : 'NON'}"`
    );

    this.telecharger([header, ...rows].join('\n'), 'modeles-echeancier.csv', 'text/csv');
  }

  exporterExcel(): void {
    this.showToast('Export Excel : brancher SheetJS', 'error');
  }

  imprimerPDF(): void {
    window.print();
  }

  onImportFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.showToast(`Import "${file.name}"`, 'success');
    }
  }

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

  private showToast(message: string, type: ToastType): void {
    this.toast = { message, type };
    this.cdr.markForCheck();

    setTimeout(() => {
      this.toast = null;
      this.cdr.markForCheck();
    }, 3500);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control.touched);
  }

  natureBadgeClass(nature: NatureTypeFrais): string {
    const mapping: Record<string, string> = {
      INSCRIPTION: 'pill--blue',
      SCOLARITE: 'pill--green',
      ANNEXE: 'pill--orange',
      AUTRE: 'pill--gray'
    };

    return mapping[nature] ?? 'pill--gray';
  }

  trackById(_: number, item: ModeleEcheancier): number | undefined {
    return item.id;
  }
}
