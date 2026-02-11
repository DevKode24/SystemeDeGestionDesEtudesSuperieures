import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { EtudiantService } from 'src/app/services/etudiant.service';
import { EnseignantService } from 'src/app/services/enseignant.service';
import { UeService } from 'src/app/services/ue.service';
import { MatiereService } from 'src/app/services/matiere.service';

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.scss']
})
export class StatistiquesComponent {

  // Données brutes
  etudiants: any[] = [];
  enseignants: any[] = [];
  ues: any[] = [];
  matieres: any[] = [];

  // KPIs
  totalEtudiants = 0;
  totalEnseignants = 0;
  totalMatieres = 0;
  tauxReussite = 0;

  // Graphiques
  chartEtudiantsParFiliere: any;
  chartRepartitionSexe: any;
  chartRedoublement: any;
  chartMoyenneParSemestre: any;

  constructor(
    private etudiantService: EtudiantService,
    private enseignantService: EnseignantService,
    private ueService: UeService,
    private matiereService: MatiereService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    forkJoin({
      etudiants: this.etudiantService.getAll(),
      enseignants: this.enseignantService.getAll(),
      ues: this.ueService.getAll(),
      matieres: this.matiereService.getAll()
    }).subscribe({
      next: res => {
        this.etudiants = res.etudiants;
        this.enseignants = res.enseignants;
        this.ues = res.ues;
        this.matieres = res.matieres;

        this.computeKPIs();
        this.prepareCharts();
      },
      error: err => console.error(err)
    });
  }

  computeKPIs(): void {
    this.totalEtudiants = this.etudiants.length;
    this.totalEnseignants = this.enseignants.length;
    this.totalMatieres = this.matieres.length;

    const admis = this.etudiants.filter(e => e.decision === 'Admis').length;
    this.tauxReussite = this.totalEtudiants ? Math.round((admis / this.totalEtudiants) * 100) : 0;
  }

  prepareCharts(): void {
    // ------------------------------
    // Étudiants par filière
    // ------------------------------
    const filieresMap: Record<string, number> = {};
    this.etudiants.forEach(e => {
      const f: string = e.filiere?.nom ?? 'Inconnu';
      filieresMap[f] = (filieresMap[f] || 0) + 1;
    });
    this.chartEtudiantsParFiliere = {
      labels: Object.keys(filieresMap),
      datasets: [{
        data: Object.values(filieresMap),
        label: 'Étudiants par filière',
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC']
      }]
    };

    // ------------------------------
    // Répartition sexe
    // ------------------------------
    type Sexe = 'Masculin' | 'Féminin';
    const sexeMap: Record<Sexe, number> = { 'Masculin': 0, 'Féminin': 0 };
    this.etudiants.forEach(e => {
      const s: Sexe = (e.sexe === 'Féminin') ? 'Féminin' : 'Masculin';
      sexeMap[s] += 1;
    });
    this.chartRepartitionSexe = {
      labels: Object.keys(sexeMap),
      datasets: [{
        data: Object.values(sexeMap),
        backgroundColor: ['#42A5F5', '#FF6384']
      }]
    };

    // ------------------------------
    // Redoublement / Ajourné / Admis
    // ------------------------------
    type Statut = 'Admis' | 'Ajourné' | 'Redoublant';
    const statutMap: Record<Statut, number> = { 'Admis': 0, 'Ajourné': 0, 'Redoublant': 0 };
    this.etudiants.forEach(e => {
      const decision: Statut = (e.decision === 'Ajourné') ? 'Ajourné'
        : (e.decision === 'Redoublant') ? 'Redoublant'
        : 'Admis';
      statutMap[decision] += 1;
    });
    this.chartRedoublement = {
      labels: Object.keys(statutMap),
      datasets: [{
        data: Object.values(statutMap),
        backgroundColor: ['#66BB6A', '#FFA726', '#FF6384']
      }]
    };

    // ------------------------------
    // Moyenne par semestre
    // ------------------------------
    const semestresMap: Record<string, number[]> = {};
    this.etudiants.forEach(e => {
      const s: string = e.semestre?.numero ?? 'S1';
      if (!semestresMap[s]) semestresMap[s] = [];
      semestresMap[s].push(e.moyenneSemestre ?? 0);
    });
    this.chartMoyenneParSemestre = {
      labels: Object.keys(semestresMap),
      datasets: [{
        label: 'Moyenne par semestre',
        data: Object.values(semestresMap).map((arr: number[]) =>
          arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
        ),
        borderColor: '#42A5F5',
        fill: false
      }]
    };
  }
}
