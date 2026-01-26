import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EtudiantService } from '../../services/etudiant.service';
import { ClasseService } from 'src/app/services/classe.service';
import { Classe, Etudiant, Filiere, Niveau, AnneeAcademique } from 'src/app/models/etudiant';

@Component({
  selector: 'app-etudiant',
  templateUrl: './etudiant.component.html',
  styleUrls: ['./etudiant.component.scss']
})
export class EtudiantComponent implements OnInit {

  etudiants: Etudiant[] = [];
  filteredEtudiants: Etudiant[] = [];
  classes: Classe[] = [];
  anneesAcademiques: AnneeAcademique[] = [];

  form!: FormGroup;
  editingId: number | null = null;
  loading = false;

  selectedClasse!: Classe;

  sexes = ['M', 'F', 'Pas de genre'];
  etatsCivils = ['Marié', 'Célibataire', 'En couple', 'Conjoint'];
  nationalites = [
    'Gabonaise','Congolaise','Camerounaise','Ivoirienne','Sénégalaise',
    'Française','Canadienne','Américaine','Chinoise','Marocaine',
    'Algérienne','Tunisienne','Nigériane','Ghanéenne'
  ];

  constructor(
    private fb: FormBuilder,
    private etudiantService: EtudiantService,
    private classeService: ClasseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEtudiants();
    this.loadClasses();
    this.loadAnneesAcademiques();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      matricule: ['', Validators.required],
      dateNaissance: [''],
      dateInscription: [new Date().toISOString().substring(0,10)],
      sexe: ['', Validators.required],
      nationalite: ['', Validators.required],
      etatCivil: ['', Validators.required],
      lieuNaissance: [''],
      contactEtudiant: [''],
      contactUrgence: [''],
      nomTuteur: [''],
      classeId: [null, Validators.required],
      anneeAcademiqueId: [null, Validators.required]
    });
  }

  loadEtudiants(): void {
    this.etudiantService.getAll().subscribe(data => {
      this.etudiants = data;
      this.applyFilters();
    });
  }

  loadClasses(): void {
    this.classeService.getAll().subscribe(data => this.classes = data);
  }

  loadAnneesAcademiques(): void {
    this.anneesAcademiques = [
      { id: 1, libelle: '2025-2026' },
      { id: 2, libelle: '2026-2027' }
    ];
  }

  onClasseChange(): void {
    const classeId = this.form.get('classeId')?.value;
    this.selectedClasse = this.classes.find(c => c.id === +classeId)!;
  }

  applyFilters(): void {
    const nom = this.form.get('nom')?.value?.toLowerCase() || '';
    const prenom = this.form.get('prenom')?.value?.toLowerCase() || '';
    const matricule = this.form.get('matricule')?.value?.toLowerCase() || '';

    this.filteredEtudiants = this.etudiants.filter(e =>
      (!nom || e.nom.toLowerCase().includes(nom)) &&
      (!prenom || e.prenom.toLowerCase().includes(prenom)) &&
      (!matricule || e.matricule.toLowerCase().includes(matricule))
    );
  }

  save(): void {
    if (this.form.invalid || !this.selectedClasse) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload: Etudiant = {
      id: this.editingId ?? undefined,
      nom: this.form.value.nom,
      prenom: this.form.value.prenom,
      email: this.form.value.email,
      password: this.form.value.password,
      matricule: this.form.value.matricule,
      dateNaissance: this.form.value.dateNaissance,
      dateInscription: this.form.value.dateInscription,
      sexe: this.form.value.sexe,
      nationalite: this.form.value.nationalite,
      etatCivil: this.form.value.etatCivil,
      lieuNaissance: this.form.value.lieuNaissance,
      contactEtudiant: this.form.value.contactEtudiant,
      contactUrgence: this.form.value.contactUrgence,
      nomTuteur: this.form.value.nomTuteur,
      roles: ['ETUDIANT'],
      actif: true,

      // dérivation automatique depuis la classe sélectionnée
      classe: this.selectedClasse,
      filiere: { id: this.selectedClasse.filiereId, nom: this.selectedClasse.filiereNom },
      niveau: { id: this.selectedClasse.niveauId, libelle: this.selectedClasse.niveauLibelle, filiereId: this.selectedClasse.filiereId },
      anneeAcademique: { id: this.form.value.anneeAcademiqueId }
    };

    const request$ = this.editingId
      ? this.etudiantService.modifier(this.editingId, payload)
      : this.etudiantService.creer(payload);

    request$.subscribe({
      next: () => { this.resetForm(); this.loadEtudiants(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  edit(e: Etudiant): void {
    this.editingId = e.id!;
    this.selectedClasse = e.classe;

    this.form.patchValue({
      nom: e.nom,
      prenom: e.prenom,
      email: e.email,
      matricule: e.matricule,
      dateNaissance: e.dateNaissance,
      dateInscription: e.dateInscription,
      sexe: e.sexe,
      nationalite: e.nationalite,
      etatCivil: e.etatCivil,
      lieuNaissance: e.lieuNaissance,
      contactEtudiant: e.contactEtudiant,
      contactUrgence: e.contactUrgence,
      nomTuteur: e.nomTuteur,
      classeId: e.classe.id,
      anneeAcademiqueId: e.anneeAcademique?.id
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset();
    this.selectedClasse = {} as Classe; // safe pour TS
  }
}
