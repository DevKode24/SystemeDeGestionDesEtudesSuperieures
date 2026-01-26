import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role, TokenStorageService } from 'src/app/auth/token-storage.service';
import { Ue } from 'src/app/models/ue';
import { UeService } from 'src/app/services/ue.service';
import { Semestre } from 'src/app/models/semestre';
import { SemestreService } from 'src/app/services/semestre.service';

@Component({
  selector: 'app-ue',
  templateUrl: './ue.component.html',
  styleUrls: ['./ue.component.scss']
})
export class UeComponent implements OnInit {

  ues: Ue[] = [];
  filteredUes: Ue[] = [];
  semestres: Semestre[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  filterIntitule = '';
  filterSemestreId: number | null = null;

  role: Role | Role[] | null = null;

  constructor(
    private fb: FormBuilder,
    private ueService: UeService,
    private semestreService: SemestreService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.role = this.tokenStorage.getUserRole();
    this.initForm();
    this.loadSemestres();
    this.loadUes();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      intitule: ['', Validators.required],
      credit: [null, [Validators.required, Validators.min(1)]],
      coefficient: [null, [Validators.required, Validators.min(1)]],
      semestreId: [null, Validators.required] // 🔹 obligatoire
    });
  }

  loadSemestres(): void {
    this.semestreService.getAll().subscribe(data => this.semestres = data);
  }

 loadUes(): void {
  if (this.filterSemestreId) {
    // 🔹 Charger uniquement les UE du semestre filtré
    this.ueService.getBySemestre(this.filterSemestreId).subscribe({
      next: (data: Ue[]) => {
        this.ues = data;
        this.applyFilters(); // si tu as d'autres filtres
      },
      error: (err) => {
        console.error('Erreur lors du chargement des UE par semestre :', err);
        this.ues = [];
        this.filteredUes = [];
      }
    });
  } else {
    // 🔹 Charger toutes les UE
    this.ueService.getAll().subscribe({
      next: (data: Ue[]) => {
        this.ues = data;
        this.filteredUes = [...data]; // initialiser filteredUes
      },
      error: (err) => {
        console.error('Erreur lors du chargement de toutes les UE :', err);
        this.ues = [];
        this.filteredUes = [];
      }
    });
  }
}


  applyFilters(): void {
    const term = this.filterIntitule.toLowerCase().trim();
    this.filteredUes = this.ues.filter(u =>
      !term ||
      u.code.toLowerCase().includes(term) ||
      u.intitule.toLowerCase().includes(term)
    );
  }

  save(): void {
    if (this.form.invalid) return;

    this.loading = true;

    // 🔹 Créer l'objet DTO complet pour le backend
    const ueDto: Ue = {
      code: this.form.value.code,
      intitule: this.form.value.intitule,
      credit: this.form.value.credit,
      coefficient: this.form.value.coefficient,
      semestre: { id: this.form.value.semestreId } // 🔹 Transformation clé
    };

    const action$ = this.editingId
      ? this.ueService.update(this.editingId, ueDto)
      : this.ueService.create(ueDto);

    action$.subscribe({
      next: () => {
        this.resetForm();
        this.loadUes();
      },
      error: (err) => {
        console.error('Erreur création / modification UE', err);
        alert('Erreur lors de l’enregistrement de l’UE !');
      },
      complete: () => this.loading = false
    });
  }

  edit(u: Ue): void {
    this.editingId = u.id ?? null;
    this.form.patchValue({
      code: u.code,
      intitule: u.intitule,
      credit: u.credit,
      coefficient: u.coefficient,
      semestreId: u.semestre?.id ?? null
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette UE ?')) return;
    this.ueService.delete(id).subscribe(() => this.loadUes());
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = null;
    this.loading = false;
  }

 getSemestreNumero(semestre?: Semestre): number | string {
  return semestre?.numero ?? '-';
}
  

  canEdit(): boolean {
    if (!this.role) return false;
    return Array.isArray(this.role)
      ? this.role.includes(Role.Admin) || this.role.includes(Role.Scolarite)
      : this.role === Role.Admin || this.role === Role.Scolarite;
  }
}
