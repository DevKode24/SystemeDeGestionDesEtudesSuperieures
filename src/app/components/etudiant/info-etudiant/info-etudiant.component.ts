import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EtudiantService } from 'src/app/services/etudiant.service';
import { FiliereService } from 'src/app/services/filiere.service';
import { ClasseService } from 'src/app/services/classe.service';
import { Etudiant } from 'src/app/models/etudiant';
import { Filiere } from 'src/app/models/filiere';
import { Classe } from 'src/app/models/classe';
import { Niveau } from 'src/app/models/niveau';
import { AnneeAcademiqueService } from 'src/app/services/anneeacademique.service';
import { AnneeAcademique } from 'src/app/models/annee-academique';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-info-etudiant',
  templateUrl: './info-etudiant.component.html',
  styleUrls: ['./info-etudiant.component.scss']
})
export class InfoEtudiantComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    // Méthode requise par l'interface AfterViewInit
  }

  etudiant?: Etudiant;
  
  // 🔥 CACHES : tous les objets disponibles
  filieres: Filiere[] = [];
  classes: Classe[] = [];
  niveaux: Niveau[] = [];
  anneesAcademiques: AnneeAcademique[] = [];
  
  
  loading: boolean = false;
  qrCodeImage: string = '';
  darkMode: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private etudiantService: EtudiantService,
    private anneeAcademiqueService: AnneeAcademiqueService,
    private filiereService: FiliereService,
    private classeService: ClasseService
  ) {}

  ngOnInit(): void {
    this.loadAllReferences(); // Charge TOUS les objets d'abord
  }

  /** 🔥 CHARGE TOUS LES OBJETS DE RÉFÉRENCE */
  loadAllReferences(): void {
    this.loading = true;
    
    forkJoin({
      filieres: this.filiereService.getAll(),
      classes: this.classeService.getAll(),
      niveaux: this.classeService.getNiveaux(),
      annees: this.anneeAcademiqueService.getAll()  
    }).subscribe({
      next: (data) => {
        this.filieres = data.filieres;
        this.classes = data.classes;
        this.niveaux = data.niveaux;
        this.anneesAcademiques = data.annees;
        
        // ENSUITE charge l'étudiant
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.loadEtudiant(+id);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement références:', err);
        this.loading = false;
      }
    });
  }

  loadEtudiant(id: number): void {
    this.etudiantService.getById(id).subscribe({
      next: (data) => {
        this.etudiant = data;
        this.generateQRCode();
        setTimeout(() => this.generateBarcode(), 500);
      },
      error: (err) => {
        console.error('Erreur chargement étudiant :', err);
      }
    });
  }

  /* ============================= ACTIONS (IDENTIQUES) */
  toggleTheme(): void {
    this.darkMode = !this.darkMode;
  }

  printPage(): void {
    window.print();
  }

  async generatePDF(): Promise<void> {
    const element = document.getElementById('studentCard');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { 
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`fiche-etudiant-${this.etudiant?.matricule || 'unknown'}.pdf`);
    } catch (error) {
      console.error('Erreur génération PDF :', error);
    }
  }

  generateQRCode(): void {
    if (!this.etudiant?.id) return;
    const url = `${window.location.origin}/etudiant/${this.etudiant.id}`;
    
    QRCode.toDataURL(url, {
      width: 256,
      margin: 1,
      color: { dark: '#1e293b', light: '#ffffff' }
    }).then((dataUrl: string) => {
      this.qrCodeImage = dataUrl;
    }).catch(console.error);
  }

  generateBarcode(): void {
    if (!this.etudiant?.matricule) return;
    const barcodeElement = document.getElementById('barcode');
    if (!barcodeElement) return;

    JsBarcode(barcodeElement as HTMLCanvasElement, 
      this.etudiant.matricule.toUpperCase(), 
      {
        format: 'CODE128',
        width: 3,
        height: 70,
        displayValue: false,
        background: '#ffffff',
        lineColor: '#1e293b',
        margin: 10
      }
    );
  }

  /* ============================= GETTERS SÉCURISÉS avec find() ✅ */
  get filiereNom(): string {
    const filiereId = this.etudiant?.filiereId || this.etudiant?.filiere?.id;
    const filiere = this.filieres.find(f => f.id === filiereId);
    return filiere?.nom || (filiereId ? `Filière ${filiereId}` : 'Filière non définie');
  }
  get anneeLibelle(): string {
  const anneeId = this.etudiant?.anneeAcademiqueId || this.etudiant?.anneeAcademique?.id;
  const annee = this.anneesAcademiques.find(a => a.id === anneeId);
  return annee?.libelle || (anneeId ? `Année ${anneeId}` : 'Non définie');
}


  get niveauLibelle(): string {
    const niveauId = this.etudiant?.niveauId || 
                    this.etudiant?.niveau?.id || 
                    this.classeFromId(this.etudiant?.classeId)?.niveau?.id;
    const niveau = this.niveaux.find(n => n.id === niveauId);
    return niveau?.libelle || (niveauId ? `Niveau ${niveauId}` : 'Niveau non défini');
  }

  get classeCode(): string {
    const classeId = this.etudiant?.classeId || this.etudiant?.classe?.id;
    const classe = this.classes.find(c => c.id === classeId);
    return classe?.code || (classeId ? `Classe ${classeId}` : 'Classe non assignée');
  }

  // 🔥 UTILITAIRE : trouve classe par ID
  private classeFromId(classeId?: number): Classe | undefined {
    return classeId ? this.classes.find(c => c.id === classeId) : undefined;
  }

  get isLoading(): boolean {
    return this.loading;
  }
}