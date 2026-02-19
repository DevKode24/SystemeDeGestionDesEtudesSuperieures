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
import { MatiereService } from 'src/app/services/matiere.service';
import { SemestreService } from 'src/app/services/semestre.service';
import { UeService } from 'src/app/services/ue.service';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';

@Component({
  selector: 'app-bulletin',
  templateUrl: './bulletin.component.html',
  styleUrls: ['./bulletin.component.scss']
})
export class BulletinComponent implements OnInit {

  annees: AnneeAcademique[] = [];
  classes: Classe[] = [];
  etudiants: Etudiant[] = [];
  matieres: Matiere[] = [];
  semestres: Semestre[] = [];
  ues: Ue[] = [];

  bulletins: any[] = [];

  selectedClasseId!: number;
  selectedAnneeId!: number;
  selectedEtudiantId!: number;

  loading = false;
  message = '';
  today = new Date();

  constructor(
    private bulletinService: BulletinService,
    private classeService: ClasseService,
    private etudiantService: EtudiantService,
    private anneeService: AnneeAcademiqueService,
    private matiereService: MatiereService,
    private semestreService: SemestreService,
    private ueService: UeService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    this.anneeService.getAll().subscribe(d => this.annees = d);
    this.classeService.getAll().subscribe(d => this.classes = d);
    this.matiereService.getAll().subscribe(d => this.matieres = d);
    this.semestreService.getAll().subscribe(d => this.semestres = d);
    this.ueService.getAll().subscribe(d => this.ues = d);
  }

  onClasseChange() {
    if (!this.selectedClasseId) return;
    this.etudiantService.getByClasse(this.selectedClasseId)
      .subscribe(d => this.etudiants = d);
  }

  chargerBulletins() {
    if (!this.selectedClasseId || !this.selectedAnneeId) {
      this.message = "Veuillez sélectionner une classe et une année";
      return;
    }
    this.loading = true;
    this.message = '';
    this.bulletinService
      .getByClasseAndAnnee(this.selectedClasseId, this.selectedAnneeId)
      .subscribe({
        next: (data) => {
          this.bulletins = data.map(b => ({
            ...b,
            semestresGroupes: this.regrouperParSemestre(b)
          }));
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.message = "Erreur lors du chargement";
        }
      });
  }

  genererClasse() {
    if (!this.selectedClasseId || !this.selectedAnneeId) return;
    this.bulletinService
      .genererBulletinsClasse(this.selectedClasseId, this.selectedAnneeId)
      .subscribe(() => this.chargerBulletins());
  }

  genererEtudiant() {
    if (!this.selectedEtudiantId || !this.selectedAnneeId) return;
    this.bulletinService
      .genererBulletin(this.selectedEtudiantId, this.selectedAnneeId)
      .subscribe(() => this.chargerBulletins());
  }

  regrouperParSemestre(b: Bulletin) {
    if (!b?.lignesBulletin?.length) return [];
    const map: Record<number, { numero: number; lignes: any[] }> = {};
    b.lignesBulletin.forEach(l => {
      const semestre = this.semestres.find(s => s.id === l.semestreId);
      if (!semestre || semestre.numero == null) return;
      if (!map[semestre.numero]) map[semestre.numero] = { numero: semestre.numero, lignes: [] };
      map[semestre.numero].lignes.push(l);
    });
    return Object.values(map).sort((a, b) => a.numero - b.numero);
  }

  getEtudiant(id?: number) {
    return this.etudiants.find(e => e.id === id);
  }

  getClasse(id?: number) {
    return this.classes.find(c => c.id === id);
  }

  getAnneeLibelle(id?: number) {
    return this.annees.find(a => a.id === id)?.libelle ?? '';
  }

  getMatiereIntitule(id?: number) {
    return this.matieres.find(m => m.id === id)?.intitule ?? '';
  }

  getUeIntitule(id?: number) {
    return this.ues.find(u => u.id === id)?.intitule ?? '';
  }

  /* ====================== PDF OFFICIEL ====================== */
  genererPDF(b: any) {
    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();
    const etu = this.getEtudiant(b.etudiantId);
    const classe = this.getClasse(b.classeId);

    // HEADER
    doc.setFontSize(10);
    doc.text("Université XYZ", 14, 10);
    doc.text("RÉPUBLIQUE GABONAISE", width - 14, 10, { align: 'right' });
    doc.text("Union - Travail - Justice", width - 14, 15, { align: 'right' });
    doc.addImage("assets/logo.png", "PNG", width/2 - 15, 5, 30, 30);

    // TITRE
    doc.setFontSize(14);
    doc.text("BULLETIN DE NOTES", width/2, 40, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Année Académique: ${this.getAnneeLibelle(b.anneeAcademiqueId)}`, width/2, 46, { align: 'center' });

    // PHOTO & INFO ETUDIANT
    doc.rect(14, 50, 30, 35); // cadre photo
    doc.text("Photo", 16, 68);
    doc.text(`Matricule: ${etu?.matricule}`, 14, 90);

    doc.text(`Nom: ${etu?.nom}`, 50, 55);
    doc.text(`Prénom: ${etu?.prenom}`, 50, 60);
    doc.text(`Sexe: ${etu?.sexe}`, 50, 65);
    doc.text(`Date Naissance: ${etu?.dateNaissance}`, 50, 70);
    doc.text(`Lieu Naissance: ${etu?.lieuNaissance}`, 50, 75);

    doc.text(`Filière: ${classe?.filiere}`, width-60, 55);
    doc.text(`Niveau: ${classe?.niveau}`, width-60, 60);
    doc.text(`Classe: ${classe?.code}`, width-60, 65);

    // TABLEAU
    const tableData: any[] = [];
    b.semestresGroupes.forEach((sem: any) => {
      tableData.push([{
        content: `Semestre ${sem.numero}`,
        colSpan: 8,
        styles: { halign: 'center', fontStyle: 'bold', fillColor: [220,220,220] }
      }]);
      sem.lignes.forEach((l: any) => {
        tableData.push([
          `S${sem.numero}`,
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
      startY: 95,
      head: [['Sem','UE','Matière','Cr','Note','Coef','Note x Coef','Session']],
      body: tableData,
      styles: { fontSize: 9 }
    });

    // BILAN
    const yBilan = (doc as any).lastAutoTable.finalY + 5;
    const colWidth = width/3 - 10;

    doc.text(`UE validées: ${b.ueValidees}`, 14, yBilan);
    doc.text(`UE cumulées: ${b.ueCumulees}`, 14, yBilan+6);
    doc.text(`% Crédit requis: ${b.pourcentageCreditRequis}%`, 14, yBilan+12);

    doc.text(`Crédits obtenus: ${b.creditsObtenus}`, width/3+5, yBilan);
    doc.text(`Total crédits cumulés: ${b.totalCreditsCumules}`, width/3+5, yBilan+6);
    doc.text(`% Crédit cumulé: ${b.pourcentageCreditCumule}%`, width/3+5, yBilan+12);

    doc.text(`Moyenne: ${b.moyenneAnnuelle?.toFixed(2)}`, 2*width/3+5, yBilan);
    doc.text(`Grade: ${b.grade}`, 2*width/3+5, yBilan+6);
    doc.text(`Décision: ${b.decisionConseil}`, 2*width/3+5, yBilan+12);

    // SIGNATURE
    doc.text(`Fait à Libreville, le ${this.today.toLocaleDateString()}`, 14, yBilan+25);
    doc.text("Le Président du Jury", width-60, yBilan+25);

    doc.save(`Bulletin_${etu?.nom}.pdf`);
  }
}
