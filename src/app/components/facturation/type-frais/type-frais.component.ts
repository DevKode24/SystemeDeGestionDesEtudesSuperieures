import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TypeFraisService } from 'src/app/services/type-frais.service';
import { TypeFrais } from 'src/app/models/type-frais';

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

  // ================= DATA =================
  typeFrais: TypeFrais[] = [];
  filteredTypeFrais: TypeFrais[] = [];

  form!: FormGroup;
  editingId: number | null = null;

  loading = false;
  vue: Vue = 'table';

  // ================= FILTER + PAGINATION =================
  searchNom = '';
  searchDescription = '';

  page = 1;
  pageSize = 10;

  // ================= TOASTS =================
  private _toastId = 0;
  toasts: Toast[] = [];

  // ================= CONSTRUCTEUR =================
  constructor(
    private fb: FormBuilder,
    private service: TypeFraisService
  ) {}

  // ================= HOOKS =================
  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  // ================= FORM =================
  initForm(): void {
    this.form = this.fb.group({
      nom: [''],
      description: ['']
    });
  }

  // ================= LOAD =================
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

  // ================= FILTER =================
  applyFilter(): void {
    const nom = this.searchNom.toLowerCase().trim();
    const desc = this.searchDescription.toLowerCase().trim();

    this.filteredTypeFrais = this.typeFrais.filter(t =>
      (nom === '' || t.nom.toLowerCase().includes(nom)) 
     
    );
  }

  onSearchChange(): void {
    this.applyFilter();
    this.page = 1;
  }

  // ================= PAGINATION =================
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

  // ================= VIEW =================
  isVueTable(): boolean {
    return this.vue === 'table';
  }

  isVueGrid(): boolean {
    return this.vue === 'grid';
  }

  setVue(v: Vue): void {
    this.vue = v;
  }

  // ================= CRUD =================
  save(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const payload: TypeFrais = {
      ...this.form.value
    };

    const action$ = this.editingId
      ? this.service.updateTypeFrais(this.editingId, payload)
      : this.service.createTypeFrais(payload);

    action$.subscribe({
      next: () => {
        this.resetForm();
        this.loadData();
        this.toast('success', '✅ Type de frais enregistré');
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
    this.form.patchValue(t);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (!confirm('⚠️ Supprimer ce type de frais ?')) return;

    this.service.deleteTypeFrais(id).subscribe({
      next: () => {
        this.loadData();
        this.toast('info', '🗑️ Type de frais supprimé');
      },
      error: err => {
        this.toast('error', err?.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
  }

  // ================= TOASTS =================
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

  // ========================================================
  // UTILITÉS POUR LE TEMPLATE (type-safe, évite TS2367)
  // ========================================================

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
