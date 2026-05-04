import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { FraisAcademique } from 'src/app/models/frais-academique';
import { TypeFrais } from 'src/app/models/type-frais';
import { Filiere } from 'src/app/models/filiere';
import { Niveau } from 'src/app/models/niveau';
import { AnneeAcademique } from 'src/app/models/annee-academique';

import { TypeFraisService } from 'src/app/services/type-frais.service';
import { FiliereService } from 'src/app/services/filiere.service';
import { NiveauService } from 'src/app/services/niveau.service';
import { FraisAcademiqueService } from 'src/app/services/frais-academiques.service';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';

@Component({
  selector: 'app-frais-academiques',
  templateUrl: './frais-academiques.component.html',
  styleUrls: ['./frais-academiques.component.scss']
})
export class FraisAcademiquesComponent implements OnInit {

  form!: FormGroup;

  fraisList: FraisAcademique[] = [];
  filteredFrais: FraisAcademique[] = [];

  typesFrais: TypeFrais[] = [];
  filieres: Filiere[] = [];
  niveaux: Niveau[] = [];
  annees: AnneeAcademique[] = [];

  editingId?: number;
  loading = false;
  message = '';

  // filtres
  filterType = '';
  filterFiliere = '';
  filterNiveau = '';
  filterAnnee = '';

  page = 1;
  pageSize = 10;

  constructor(
    private fb: FormBuilder,
    private service: FraisAcademiqueService,
    private typeService: TypeFraisService,
    private filiereService: FiliereService,
    private niveauService: NiveauService,
    private anneeService: AnneeAcademiqueService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReferentiels();
  }

  /* ================= INIT ================= */

  initForm(): void {
    this.form = this.fb.group({
      montant: [null, [Validators.required, Validators.min(0)]],
      typeFraisId: [null, Validators.required],
      filiereId: [null, Validators.required],
      niveauId: [null, Validators.required],
      anneeAcademiqueId: [null, Validators.required]
    });
  }

  /* ================= LOAD ================= */

  loadReferentiels(): void {
    this.loading = true;

    forkJoin({
      types: this.typeService.getAllTypesFrais(),
      filieres: this.filiereService.getAll(),
      niveaux: this.niveauService.getAll(),
      annees: this.anneeService.getAll()
    }).subscribe(res => {

      this.typesFrais = res.types;
      this.filieres = res.filieres;
      this.niveaux = res.niveaux;
      this.annees = res.annees;

      this.loadFrais();
    });
  }

  loadFrais(): void {
    this.service.getAllFrais().subscribe(data => {

      // 🔥 ENRICHISSEMENT (comme Enseignement)
      this.fraisList = data.map(f => ({
        ...f,
        typeFrais: this.typesFrais.find(t => t.id === f.typeFraisId),
        filiere: this.filieres.find(fl => fl.id === f.filiereId),
        niveau: this.niveaux.find(n => n.id === f.niveauId),
        anneeAcademique: this.annees.find(a => a.id === f.anneeAcademiqueId)
      }));

      this.filteredFrais = [...this.fraisList];
      this.loading = false;
    });
  }

  /* ================= FILTER ================= */

  applyFilters(): void {
    this.filteredFrais = this.fraisList.filter(f =>
      (f.typeFrais?.nom ?? '').toLowerCase().includes(this.filterType.toLowerCase()) &&
      (f.filiere?.nom ?? '').toLowerCase().includes(this.filterFiliere.toLowerCase()) &&
      (f.niveau?.libelle ?? '').toLowerCase().includes(this.filterNiveau.toLowerCase()) &&
      (f.anneeAcademique?.libelle ?? '').toLowerCase().includes(this.filterAnnee.toLowerCase())
    );

    this.page = 1;
  }

  /* ================= CRUD ================= */

save(): void {
  if (this.form.invalid) {
    this.message = "⚠️ Veuillez remplir tous les champs obligatoires.";
    return;
  }

  const payload: FraisAcademique = this.form.value;   // ça marche car les noms correspondent

  const action$ = this.editingId
    ? this.service.updateFrais(this.editingId, payload)
    : this.service.createFrais(payload);

  action$.subscribe({
    next: () => {
      this.message = "✅ Frais enregistré avec succès.";
      this.resetForm();
      this.loadFrais();
    },
    error: (err) => {
      this.message = "❌ Erreur : " + (err.error?.message || err.message || "Erreur inconnue");
      console.error(err);
    }
  });
}

  edit(f: FraisAcademique): void {
    this.editingId = f.id;
    this.form.patchValue(f);
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (!confirm("Supprimer ce frais ?")) return;

    this.service.deleteFrais(id).subscribe(() => {
      this.message = "🗑️ Frais supprimé.";
      this.loadFrais();
    });
  }

  resetForm(): void {
    this.form.reset();
    this.editingId = undefined;
  }

  /* ================= PAGINATION ================= */

  get paginated(): FraisAcademique[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredFrais.slice(start, start + this.pageSize);
  }
}