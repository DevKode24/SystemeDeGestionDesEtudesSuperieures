import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TypeFrais, NatureTypeFrais } from 'src/app/models/type-frais';
import { ParametrageTypeFrais } from 'src/app/models/parametrage-type-frais';

import { TypeFraisService } from 'src/app/services/type-frais.service';
import { ParametrageTypeFraisService } from 'src/app/services/parametrage-type.service';

type Vue = 'table' | 'grid';
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Component({
  selector: 'app-parametrage-type-frais',
  templateUrl: './parametrage-type-frais.component.html',
  styleUrls: ['./parametrage-type-frais.component.scss']
})
export class ParametrageTypeFraisComponent implements OnInit {
  parametrages: ParametrageTypeFrais[] = [];
  filteredParametrages: ParametrageTypeFrais[] = [];
  typesFrais: TypeFrais[] = [];

  form!: FormGroup;
  editingId: number | null = null;

  loading = false;
  vue: Vue = 'table';

  searchLibelle = '';
  searchNature = '';
  searchFractionnable = '';

  page = 1;
  pageSize = 10;

  readonly natures: NatureTypeFrais[] = ['INSCRIPTION', 'SCOLARITE', 'ANNEXE', 'AUTRE'];

  private _toastId = 0;
  toasts: Toast[] = [];

  constructor(
    private fb: FormBuilder,
    private typeFraisService: TypeFraisService,
    private parametrageService: ParametrageTypeFraisService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTypesFrais();
    this.loadData();
  }

  initForm(): void {
    this.form = this.fb.group({
      typeFraisId: [null, Validators.required],
      libelle: ['', [Validators.required, Validators.minLength(2)]],
      nature: ['AUTRE', Validators.required],
      montantParDefaut: [null, [Validators.min(0)]],
      fractionnable: [false],
      nombreTranchesDefaut: [1, [Validators.required, Validators.min(1), Validators.max(24)]],
      nombreTranchesMax: [1, [Validators.required, Validators.min(1), Validators.max(24)]],
      periodiciteMois: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      paiementInitialObligatoire: [false],
      actif: [true]
    });
  }

  loadTypesFrais(): void {
    this.typeFraisService.getAllTypesFrais().subscribe({
      next: (data: TypeFrais[]) => {
        this.typesFrais = data;
      },
      error: (err) => {
        this.toast('error', err?.error?.message || 'Erreur chargement des types de frais');
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.parametrageService.getAllParametragesTypeFrais().subscribe({
      next: (data: ParametrageTypeFrais[]) => {
        this.parametrages = data;
        this.applyFilter();
      },
      error: (err) => {
        this.toast('error', err?.error?.message || 'Erreur chargement des paramétrages');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onTypeFraisChange(): void {
    const typeFraisId = Number(this.form.get('typeFraisId')?.value);
    const selected = this.typesFrais.find(t => t.id === typeFraisId);

    if (!selected) return;

    this.form.patchValue({
      nature: selected.nature
    });

    const currentLibelle = this.form.get('libelle')?.value?.trim();
    if (!currentLibelle) {
      this.form.patchValue({
        libelle: selected.nom
      });
    }

    if (selected.nature === 'INSCRIPTION') {
      this.form.patchValue({
        fractionnable: false,
        nombreTranchesDefaut: 1,
        nombreTranchesMax: 1,
        periodiciteMois: 1,
        paiementInitialObligatoire: true
      });
    }

    if (selected.nature === 'SCOLARITE' && !this.editingId) {
      this.form.patchValue({
        fractionnable: true,
        nombreTranchesDefaut: 3,
        nombreTranchesMax: 6,
        periodiciteMois: 1
      });
    }
  }

  onFractionnableChange(): void {
    const fractionnable = this.form.get('fractionnable')?.value;

    if (!fractionnable) {
      this.form.patchValue({
        nombreTranchesDefaut: 1,
        nombreTranchesMax: 1,
        periodiciteMois: 1
      });
    }
  }

  applyFilter(): void {
    const libelle = this.searchLibelle.toLowerCase().trim();
    const nature = this.searchNature.trim();
    const fractionnable = this.searchFractionnable.trim();

    this.filteredParametrages = this.parametrages.filter(p => {
      const typeNom = p.typeFrais?.nom?.toLowerCase() || '';
      const matchLibelle =
        libelle === '' ||
        p.libelle.toLowerCase().includes(libelle) ||
        typeNom.includes(libelle);

      const matchNature = nature === '' || p.nature === nature;
      const matchFractionnable = fractionnable === '' || String(p.fractionnable) === fractionnable;

      return matchLibelle && matchNature && matchFractionnable;
    });

    this.page = 1;
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  resetFilters(): void {
    this.searchLibelle = '';
    this.searchNature = '';
    this.searchFractionnable = '';
    this.applyFilter();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredParametrages.length / this.pageSize));
  }

  get paginated(): ParametrageTypeFrais[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredParametrages.slice(start, start + this.pageSize);
  }

  changePage(p: number): void {
    this.page = Math.max(1, Math.min(p, this.totalPages));
  }

  isVueTable(): boolean {
    return this.vue === 'table';
  }

  isVueGrid(): boolean {
    return this.vue === 'grid';
  }

  setVue(v: Vue): void {
    this.vue = v;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;

    if (formValue.fractionnable && formValue.nombreTranchesDefaut > formValue.nombreTranchesMax) {
      this.toast('warning', 'Le nombre de tranches par défaut ne peut pas dépasser le maximum');
      return;
    }

    this.loading = true;

    const payload: ParametrageTypeFrais = {
      ...formValue,
      typeFraisId: Number(formValue.typeFraisId),
      montantParDefaut: formValue.montantParDefaut != null && formValue.montantParDefaut !== ''
        ? Number(formValue.montantParDefaut)
        : undefined,
      nombreTranchesDefaut: formValue.fractionnable ? Number(formValue.nombreTranchesDefaut) : 1,
      nombreTranchesMax: formValue.fractionnable ? Number(formValue.nombreTranchesMax) : 1,
      periodiciteMois: formValue.fractionnable ? Number(formValue.periodiciteMois) : 1,
      libelle: formValue.libelle?.trim()
    };

    const action$ = this.editingId
      ? this.parametrageService.updateParametrageTypeFrais(this.editingId, payload)
      : this.parametrageService.createParametrageTypeFrais(payload);

    action$.subscribe({
      next: () => {
        this.resetForm();
        this.loadData();
        this.toast('success', 'Paramétrage enregistré');
      },
      error: (err) => {
        this.toast('error', err?.error?.message || 'Erreur lors de l’enregistrement');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  edit(p: ParametrageTypeFrais): void {
    this.editingId = p.id!;
    this.form.patchValue({
      typeFraisId: p.typeFraisId,
      libelle: p.libelle,
      nature: p.nature,
      montantParDefaut: p.montantParDefaut ?? null,
      fractionnable: p.fractionnable,
      nombreTranchesDefaut: p.nombreTranchesDefaut,
      nombreTranchesMax: p.nombreTranchesMax,
      periodiciteMois: p.periodiciteMois,
      paiementInitialObligatoire: p.paiementInitialObligatoire ?? false,
      actif: p.actif ?? true
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (!confirm('Supprimer ce paramétrage ?')) return;

    this.parametrageService.deleteParametrageTypeFrais(id).subscribe({
      next: () => {
        this.loadData();
        this.toast('info', 'Paramétrage supprimé');
      },
      error: (err) => {
        this.toast('error', err?.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  resetForm(): void {
    this.form.reset({
      typeFraisId: null,
      libelle: '',
      nature: 'AUTRE',
      montantParDefaut: null,
      fractionnable: false,
      nombreTranchesDefaut: 1,
      nombreTranchesMax: 1,
      periodiciteMois: 1,
      paiementInitialObligatoire: false,
      actif: true
    });

    this.editingId = null;
  }

  getTypeFraisLabel(typeFraisId: number): string {
    const found = this.typesFrais.find(t => t.id === typeFraisId);
    return found ? found.nom : `Type #${typeFraisId}`;
  }

  natureBadgeClass(nature: NatureTypeFrais): string {
    switch (nature) {
      case 'INSCRIPTION': return 'bg-primary';
      case 'SCOLARITE': return 'bg-success';
      case 'ANNEXE': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  private toast(type: ToastType, message: string): void {
    const id = ++this._toastId;
    this.toasts.push({ id, type, message });

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 4500);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  getClassForToast(type: ToastType): string {
    return type;
  }
}
