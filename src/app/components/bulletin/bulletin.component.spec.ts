import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Bulletin } from 'src/app/models/bulletin';
import { AnneeAcademique } from 'src/app/models/annee-academique';
import { Classe } from 'src/app/models/classe';
import { Etudiant } from 'src/app/models/etudiant';
import { Matiere } from 'src/app/models/matiere';
import { Semestre } from 'src/app/models/semestre';
import { Ue } from 'src/app/models/ue';

import { BulletinService } from 'src/app/services/bulletin.service';
import { ClasseService } from 'src/app/services/classe.service';
import { EtudiantService } from 'src/app/services/etudiant.service';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';
import { MatiereService } from 'src/app/services/matiere.service';
import { SemestreService } from 'src/app/services/semestre.service';
import { UeService } from 'src/app/services/ue.service';

@Component({
  selector: 'app-bulletin',
  templateUrl: './bulletin.component.html',
  styleUrls: ['./bulletin.component.scss']
})
export class BulletinComponent implements OnInit {

  anneeId?: number;
  classeId?: number;
  etudiantId?: number;

  annees: AnneeAcademique[] = [];
  classes: Classe[] = [];
  etudiants: Etudiant[] = [];
  matieres: Matiere[] = [];
  semestres: Semestre[] = [];
  ues: Ue[] = [];

  bulletins: Bulletin[] = [];

  loading = false;
  error = '';

  constructor(
    private readonly bulletinService: BulletinService,
    private readonly classeService: ClasseService,
    private readonly etudiantService: EtudiantService,
    private readonly anneeService: AnneeAcademiqueService,
    private readonly matiereService: MatiereService,
    private readonly semestreService: SemestreService,
    private readonly ueService: UeService
  ) {}

  ngOnInit(): void {
    this.loadAnnees();
    this.loadClasses();
    this.loadMatieres();
    this.loadSemestres();
    this.loadUes();
  }

  /* ========================= LOAD DATA ========================= */

  loadAnnees(): void {
    this.anneeService.getAll().subscribe(data => this.annees = data);
  }

  loadClasses(): void {
    this.classeService.getAll().subscribe(data => this.classes = data);
  }

  loadMatieres(): void {
    this.matiereService.getAll().subscribe(data => this.matieres = data);
  }

  loadSemestres(): void {
    this.semestreService.getAll().subscribe(data => this.semestres = data);
  }

  loadUes(): void {
    this.ueService.getAll().subscribe(data => this.ues = data);
  }

  loadEtudiants(): void {
    if (!this.classeId) {
      this.etudiants = [];
      return;
    }
    this.etudiantService.getByClasse(this.classeId)
      .subscribe(data => this.etudiants = data);
  }

  /* ========================= FIND METHODS ========================= */

  getMatiereIntitule(matiereId?: number): string {
    const m = this.matieres.find(x => x.id === matiereId);
    return m ? m.intitule : '';
  }

  getUeIntitule(matiereId?: number): string {
    const matiere = this.matieres.find(m => m.id === matiereId);
    if (!matiere?.ueId) return '';
    const ue = this.ues.find(u => u.id === matiere.ueId);
    return ue ? ue.intitule : '';
  }

  getSemestreNumero(matiereId?: number): string {
    const matiere = this.matieres.find(m => m.id === matiereId);
    if (!matiere?.semestreId) return '';
    const semestre = this.semestres.find(s => s.id === matiere.semestreId);
    return semestre?.numero ? `S${semestre.numero}` : '';
  }

  /* ========================= GENERATION ========================= */

  generer(): void {

    if (!this.anneeId || !this.classeId) {
      this.error = 'Veuillez sélectionner année et classe';
      return;
    }

    this.loading = true;

    const action = this.etudiantId
      ? this.bulletinService.genererBulletin(this.etudiantId, this.anneeId)
      : this.bulletinService.genererBulletinsClasse(this.classeId, this.anneeId);

    action.subscribe({
      next: () => this.listerBulletins(),
      error: () => {
        this.error = 'Erreur génération';
        this.loading = false;
      }
    });
  }

  listerBulletins(): void {
    this.bulletinService
      .getByClasseAndAnnee(this.classeId!, this.anneeId!)
      .subscribe({
        next: data => {
          this.bulletins = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  /* ========================= ACTIONS ========================= */

  verrouiller(b: Bulletin): void {
    if (!b.id) return;
    this.bulletinService.verrouiller(b.id)
      .subscribe(() => b.verrouille = true);
  }

  deverrouiller(b: Bulletin): void {
    if (!b.id) return;
    this.bulletinService.deverrouiller(b.id)
      .subscribe(() => b.verrouille = false);
  }

  supprimer(b: Bulletin): void {
    if (!b.id || !confirm('Supprimer ce bulletin ?')) return;
    this.bulletinService.supprimer(b.id)
      .subscribe(() => {
        this.bulletins = this.bulletins.filter(x => x.id !== b.id);
      });
  }

  /* ========================= PDF ========================= */

  genererPDF(bulletin: Bulletin): void {

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('RÉPUBLIQUE DU GABON', 105, 15, { align: 'center' });
    doc.text('Bulletin Annuel de Notes', 105, 25, { align: 'center' });

    const tableData = bulletin.lignesBulletin?.map(ligne => [
      this.getSemestreNumero(ligne.matiereId),
      this.getUeIntitule(ligne.matiereId),
      this.getMatiereIntitule(ligne.matiereId),
      ligne.noteFinale?.toFixed(2),
      ligne.coefficientMatiere?.toFixed(2),
      ligne.notePonderee?.toFixed(2),
      ligne.credits,
      ligne.session
    ]) ?? [];

    autoTable(doc, {
      startY: 40,
      head: [['Semestre','UE','Matière','Note','Coef','Note x Coef','Crédits','Session']],
      body: tableData
    });

    doc.save(`bulletin_${bulletin.etudiantId}.pdf`);
  }
}
