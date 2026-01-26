import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnneeAcademique } from 'src/app/models/annee-academique';
import { Classe } from 'src/app/models/classe';
import { Filiere } from 'src/app/models/filiere';
import { Niveau } from 'src/app/models/niveau';
import { ClasseService } from 'src/app/services/classe.service';

@Component({
  selector: 'app-classe',
  templateUrl: './classe.component.html',
  styleUrls: ['./classe.component.scss']
})
export class ClasseComponent implements OnInit {

  form!: FormGroup;
  classes: Classe[] = [];
  filteredClasses: Classe[] = [];
  filieres: Filiere[] = [];
  niveaux: Niveau[] = [];
  editingId?: number;
  loading = false;

  // filtres
  filterCode = '';
  filterFiliere = '';
  filterNiveau = '';

  constructor(
    private fb: FormBuilder,
    private classeService: ClasseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadOptions();
    this.loadClasses();
  }

  initForm(): void {
    this.form = this.fb.group({
      code: ['', Validators.required],
      filiereId: [null, Validators.required],
      niveauId: [null, Validators.required],
      active: [true]
    });
  }

  loadOptions(): void {
    this.classeService.getFilieres().subscribe({
      next: (res) => this.filieres = res,
      error: (err) => console.error(err)
    });

    this.classeService.getNiveaux().subscribe({
      next: (res) => this.niveaux = res,
      error: (err) => console.error(err)
    });
  }

  loadClasses(): void {
    this.classeService.getAll().subscribe({
      next: (res) => {
        this.classes = res;
        this.applyFilters();
      },
      error: (err) => console.error(err)  
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const payload: Classe = this.form.value;

    const obs = this.editingId
      ? this.classeService.modifier(this.editingId, payload)
      : this.classeService.creer(payload);

    obs.subscribe({
      next: () => {
        this.loadClasses();
        this.resetForm();
      },
      error: (err) => console.error(err),
      complete: () => (this.loading = false)
    });
  }

  edit(classe: Classe): void {
    this.editingId = classe.id;
    this.form.patchValue(classe);
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  desactiverClasse(id: number): void {
    if (!confirm('Voulez-vous vraiment désactiver cette classe ?')) return;
    this.classeService.desactiver(id).subscribe({
      next: () => this.loadClasses(),
      error: (err) => console.error(err)
    });
  }

  resetForm(): void {
    this.editingId = undefined;
    this.form.reset({ active: true, anneeAcademiqueId: null });
  }

  applyFilters(): void {
  this.filteredClasses = this.classes.filter(c =>
    c.code.toLowerCase().includes(this.filterCode.toLowerCase()) &&
    (this.filterFiliere === '' || (this.filieres.find(f => f.id === c.filiereId)?.nom ?? '').toLowerCase().includes(this.filterFiliere.toLowerCase())) &&
    (this.filterNiveau === '' || (this.niveaux.find(n => n.id === c.niveauId)?.libelle ?? '').toLowerCase().includes(this.filterNiveau.toLowerCase()))
  );
}

  // Helpers pour le template
  getFiliereNom(filiereId: number): string {
    return this.filieres.find(f => f.id === filiereId)?.nom || '';
  }

  getNiveauLibelle(niveauId: number): string {
    return this.niveaux.find(n => n.id === niveauId)?.libelle || '';
  }
}
