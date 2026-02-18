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
import { formatDate } from '@angular/common';

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

  /* ========================= FIND METHODS (100% INDEPENDANT) ========================= */

  getEtudiantNom(id?: number): string {
    const e = this.etudiants.find(x => x.id === id);
    return e ? `${e.nom} ${e.prenom}` : '';
  }

  getClasseCode(id?: number): string {
    const c = this.classes.find(x => x.id === id);
    return c ? c.code : '';
  }

  getAnneeLibelle(id?: number): string {
    const a = this.annees.find(x => x.id === id);
    return a ? a.libelle : '';
  }

  getMatiereIntitule(id?: number): string {
    const m = this.matieres.find(x => x.id === id);
    return m ? m.intitule : '';
  }

  getUeIntitule(id?: number): string {
    const ue = this.ues.find(x => x.id === id);
    return ue ? ue.intitule : '';
  }

  getSemestreNumero(id?: number): string {
    const s = this.semestres.find(x => x.id === id);
    return s?.numero ? `S${s.numero}` : '';
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

genererPDF(b: Bulletin): void {

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const etudiant = this.etudiants.find(e => e.id === b.etudiantId);
  const classe = this.classes.find(c => c.id === b.classeId);

  /* ===================== ENTÊTE ===================== */

  // Gauche
  doc.setFontSize(11);
  doc.text('UNIVERSITÉ OMAR BONGO', 14, 15);
  doc.text('Faculté / École XYZ', 14, 22);

  // Centre (Logo placeholder)
  doc.setFontSize(10);
  doc.text('[LOGO]', pageWidth / 2, 18, { align: 'center' });

  // Droite
  doc.text('RÉPUBLIQUE GABONAISE', pageWidth - 14, 15, { align: 'right' });
  doc.text('Union – Travail – Justice', pageWidth - 14, 22, { align: 'right' });

  /* ===================== TITRE ===================== */

  doc.setFontSize(16);
  doc.text('BULLETIN DE NOTES', pageWidth / 2, 35, { align: 'center' });

  doc.setFontSize(11);
  doc.text(
    `Année Académique : ${this.getAnneeLibelle(b.anneeAcademiqueId)}`,
    pageWidth / 2,
    43,
    { align: 'center' }
  );

  /* ===================== INFOS ETUDIANT ===================== */

  let y = 55;

  // Cadre photo
  doc.rect(14, y, 30, 35);
  doc.setFontSize(9);
  doc.text('PHOTO', 29, y + 20, { align: 'center' });

  // Infos gauche
  doc.setFontSize(10);
  doc.text(`Matricule : ${etudiant?.matricule ?? ''}`, 14, y + 42);
  doc.text(`Nom : ${etudiant?.nom ?? ''}`, 14, y + 48);
  doc.text(`Prénom : ${etudiant?.prenom ?? ''}`, 14, y + 54);

  // Infos centre
  doc.text(`Sexe : ${etudiant?.sexe ?? ''}`, 80, y + 42);
  doc.text(
    `Date Naissance : ${
      etudiant?.dateNaissance
        ? formatDate(etudiant.dateNaissance, 'dd/MM/yyyy', 'en')
        : ''
    }`,
    80,
    y + 48
  );
  doc.text(`Lieu Naissance : ${etudiant?.lieuNaissance ?? ''}`, 80, y + 54);

  // Infos droite
  doc.text(`Filière : ${etudiant?.filiereId ?? ''}`, pageWidth - 14, y + 42, { align: 'right' });
  doc.text(`Niveau : ${etudiant?.niveauId?? ''}`, pageWidth - 14, y + 48, { align: 'right' });
  doc.text(`Classe : ${classe?.code ?? ''}`, pageWidth - 14, y + 54, { align: 'right' });

  /* ===================== TABLEAU ===================== */

  
// Regrouper les lignes par semestre
const lignesParSemestre = b.lignesBulletin?.reduce((acc, ligne) => {
  const sem = this.getSemestreNumero(ligne.semestreId);
  if (!acc[sem]) acc[sem] = [];
  acc[sem].push(ligne);
  return acc;
}, {} as { [semestre: string]: typeof b.lignesBulletin }) ?? {};

// Construire tableData avec lignes de séparation par semestre
const tableData: any[] = [];

Object.keys(lignesParSemestre)
  .sort((a, b) => parseInt(a) - parseInt(b)) // Tri par numéro de semestre
  .forEach(semestre => {
    // Ligne "Séparateur" pour le semestre
    tableData.push([
      { content: `Semestre ${semestre}`, colSpan: 8, styles: { halign: 'center', fillColor: [220, 220, 220], fontStyle: 'bold' } }
    ]);

    // Ajouter les lignes de ce semestre
    lignesParSemestre[semestre].forEach(l => {
      tableData.push([
        semestre,
        this.getUeIntitule(l.ueId),
        this.getMatiereIntitule(l.matiereId),
        l.credits,
        l.noteFinale?.toFixed(2),
        l.coefficientMatiere,
        l.notePonderee?.toFixed(2),
        l.session
      ]);
    });
  });

autoTable(doc, {
  startY: y + 50,
  head: [['Sem','UE','Matière','Cr','Note','Coef','Note x Coef','Session']],
  body: tableData,
  styles: { fontSize: 9 }
});

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  /* ===================== SECTION BILAN ===================== */

  doc.setFontSize(11);
  doc.text('BILAN ANNUEL', pageWidth / 2, finalY, { align: 'center' });

  const recapY = finalY + 10;

  // Gauche
  doc.text(`UE validées : ${b.rang ?? 0}`, 14, recapY);
  doc.text(`UE cumulées : ${b.rang ?? 0}`, 14, recapY + 7);
  doc.text(`% Crédits requis : ${b.rang ?? 0}%`, 14, recapY + 14);

  // Centre
  doc.text(`Crédits obtenus : ${b.rang ?? 0}`, pageWidth / 2, recapY, { align: 'center' });
  doc.text(`Total crédits cumulés : ${b.totalCreditsRequis ?? 0}`, pageWidth / 2, recapY + 7, { align: 'center' });
  doc.text(`% Crédits cumulés : ${b.totalCreditsRequis ?? 0}%`, pageWidth / 2, recapY + 14, { align: 'center' });

  // Droite
  doc.text(`Moyenne : ${b.moyenneAnnuelle?.toFixed(2)}`, pageWidth - 14, recapY, { align: 'right' });
  doc.text(`Grade : ${b.mention ?? ''}`, pageWidth - 14, recapY + 7, { align: 'right' });
  doc.text(`Décision : ${b.decision ?? ''}`, pageWidth - 14, recapY + 14, { align: 'right' });

  /* ===================== SIGNATURE ===================== */

  const today = new Date();
  const signatureY = recapY + 30;

  doc.text(
    `Fait à Libreville, le ${formatDate(today, 'dd/MM/yyyy', 'en')}`,
    pageWidth - 14,
    signatureY,
    { align: 'right' }
  );

  /* ===================== SAVE ===================== */

  doc.save(`Bulletin_${etudiant?.nom}_${etudiant?.prenom}.pdf`);
}

}
