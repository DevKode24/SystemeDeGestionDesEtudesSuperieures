import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TypeFraisService } from 'src/app/services/type-frais.service';
import { TypeFrais, NatureTypeFrais } from 'src/app/models/type-frais';

type Vue = 'table' | 'grid';
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Component({
  selector: 'app-type-frais',
  templateUrl: './type-frais.component.html',
  styleUrls: ['./type-frais.component.scss']
})
export class TypeFraisComponent implements OnInit {

  typeFrais: TypeFrais[] = [];
  filteredTypeFrais: TypeFrais[] = [];

  form!: FormGroup;
  editingId: number | null = null;

  loading = false;
  vue: Vue = 'table';

  searchNom = '';
  searchDescription = '';
  searchNature = '';

  page = 1;
  pageSize = 10;

  readonly natures: NatureTypeFrais[] = ['INSCRIPTION', 'SCOLARITE', 'ANNEXE', 'AUTRE'];

  private _toastId = 0;
  toasts: Toast[] = [];

  constructor(
    private fb: FormBuilder,
    private service: TypeFraisService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      nature: ['AUTRE', Validators.required],
      description: [''],
      obligatoire: [false],
      actif: [true]
    });
  }

  loadData(): void {
    this.loading = true;
    this.service.getAllTypesFrais().subscribe({
      next: (data) => {
        this.typeFrais = data;
        this.applyFilter();
      },
      error: (err) => {
        this.toast('error', err?.error?.message || 'Erreur chargement des types de frais');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const nom = this.searchNom.toLowerCase().trim();
    const desc = this.searchDescription.toLowerCase().trim();
    const nature = this.searchNature.trim();

    this.filteredTypeFrais = this.typeFrais.filter(t =>
      (nom === '' || t.nom.toLowerCase().includes(nom)) &&
      (desc === '' || (t.description || '').toLowerCase().includes(desc)) &&
      (nature === '' || t.nature === nature)
    );

    this.page = 1;
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  resetFilters(): void {
    this.searchNom = '';
    this.searchDescription = '';
    this.searchNature = '';
    this.applyFilter();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTypeFrais.length / this.pageSize));
  }

  get paginated(): TypeFrais[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredTypeFrais.slice(start, start + this.pageSize);
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
  normalizeCode(): void {
  const code = this.form.get('code')?.value;
  if (!code) return;

  this.form.patchValue({
    code: String(code).trim().toUpperCase().replace(/\s+/g, '_')
  });
}

suggestCodeFromNom(): void {
  const nom = this.form.get('nom')?.value;
  const codeControl = this.form.get('code');

  if (!nom || !codeControl || codeControl.value?.trim()) return;

  const suggested = String(nom)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  codeControl.patchValue(suggested);
}

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload: TypeFrais = {
      ...this.form.value,
      code: this.form.value.code?.trim()?.toUpperCase(),
      nom: this.form.value.nom?.trim(),
      description: this.form.value.description?.trim()
    };

    const action$ = this.editingId
      ? this.service.updateTypeFrais(this.editingId, payload)
      : this.service.createTypeFrais(payload);

    action$.subscribe({
      next: () => {
        this.resetForm();
        this.loadData();
        this.toast('success', 'Type de frais enregistre');
      },
      error: err => {
        this.toast('error', err?.error?.message || 'Erreur lors de l’enregistrement');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  edit(t: TypeFrais): void {
    this.editingId = t.id!;
    this.form.patchValue({
      nom: t.nom,
      code: t.code,
      nature: t.nature,
      description: t.description || '',
      obligatoire: t.obligatoire,
      actif: t.actif ?? true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (!confirm('Supprimer ce type de frais ?')) return;

    this.service.deleteTypeFrais(id).subscribe({
      next: () => {
        this.loadData();
        this.toast('info', 'Type de frais supprime');
      },
      error: err => {
        this.toast('error', err?.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  resetForm(): void {
    this.form.reset({
      nom: '',
      code: '',
      nature: 'AUTRE',
      description: '',
      obligatoire: false,
      actif: true
    });
    this.editingId = null;
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
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}
