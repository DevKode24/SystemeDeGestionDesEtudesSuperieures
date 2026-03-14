// ================================================================
// 📋 RELEVENOTE COMPONENT — MES RELEVÉS (ENSEIGNANT) 2026
// ✅ FIX : etudiantNom affiché via fusion etudiants + lignes
// ✅ FIX : noteFinale calculée si absente du backend
// ✅ FIX : valeurs par défaut 0 au lieu de '—'
// ================================================================

import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { SaisieNotesService } from 'src/app/services/saisie-notes.service';
import { SaisieNotes }        from 'src/app/models/saisie-notes';
import { Classe }             from 'src/app/models/classe';
import { Matiere }            from 'src/app/models/matiere';
import { AnneeAcademique }    from 'src/app/models/annee-academique';

// ─── LIGNE ENRICHIE ──────────────────────────────────────────
export interface LigneAffichage {
  etudiantId:            number;
  etudiantNom:           string;
  noteDevoir:            number | null;
  noteSessionOrdinaire:  number | null;
  noteSessionRattrapage: number | null;
  noteFinale:            number | null;
}

export interface MesMatiereNode {
  matiereId:      number;
  matiereNom:     string;
  releve:         SaisieNotes | null;
  lignes:         LigneAffichage[];
  expanded:       boolean;
  loading:        boolean;
  lignesChargees: boolean;
}

export interface MesClasseNode {
  classeId:      number;
  classeNom:     string;
  nombreReleves: number;
  matieres:      MesMatiereNode[];
  expanded:      boolean;
}

export type VuePivot = 'classe' | 'matiere';
export type TriCol   = 'classe' | 'matiere' | 'statut' | null;
interface Toast { id: number; type: 'success' | 'error' | 'info' | 'warning'; message: string; }

@Component({
  selector: 'app-relevenote',
  templateUrl: './relevenote.component.html',
  styleUrls: ['./relevenote.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class RelevenoteComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private _tid = 0;

  tousLesReleves: SaisieNotes[]   = [];
  classeNodes:    MesClasseNode[] = [];

  classes:          Classe[]          = [];
  matieres:         Matiere[]         = [];
  annees:           AnneeAcademique[] = [];
  matieresFiltrees: Matiere[]         = [];

  loading         = false;
  loadingMatieres = false;

  vuePivot:    VuePivot = 'classe';
  triColonne:  TriCol   = null;
  triAscendant = true;
  filterForm!: FormGroup;

  pageActuelle = 1;
  pageSize     = 15;

  toasts:          Toast[]            = [];
  showExportMenu   = false;
  releveVisualise: SaisieNotes | null = null;
  lignesVisualise: LigneAffichage[]   = [];

  get totalReleves(): number { return this.tousLesReleves.length; }
  get totalValides(): number { return this.tousLesReleves.filter(r => r.statut === 'VALIDE').length; }
  get totalAttente(): number { return this.tousLesReleves.filter(r => r.statut === 'EN_ATTENTE').length; }
  get totalRejetes(): number { return this.tousLesReleves.filter(r => r.statut === 'REJETE').length; }

  get relevesFiltres(): SaisieNotes[] {
    let list = [...this.tousLesReleves];
    const f  = this.filterForm?.value;
    if (!f) return list;
    if (f.statut)     list = list.filter(r => r.statut            === f.statut);
    if (f.classeId)   list = list.filter(r => r.classeId          === +f.classeId);
    if (f.matiereId)  list = list.filter(r => r.matiereId         === +f.matiereId);
    if (f.anneeId)    list = list.filter(r => r.anneeAcademiqueId === +f.anneeId);
    if (f.semestreId) list = list.filter(r => r.semestreId        === +f.semestreId);
    if (this.triColonne) {
      list.sort((a, b) => {
        const cmp = this.valeurTri(a).localeCompare(this.valeurTri(b), 'fr');
        return this.triAscendant ? cmp : -cmp;
      });
    }
    return list;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.relevesFiltres.length / this.pageSize));
  }
  get relevesPagines(): SaisieNotes[] {
    const s = (this.pageActuelle - 1) * this.pageSize;
    return this.relevesFiltres.slice(s, s + this.pageSize);
  }
  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = Math.max(1, this.pageActuelle - 2); i <= Math.min(this.totalPages, this.pageActuelle + 2); i++) pages.push(i);
    return pages;
  }

  get classeNodesFiltres(): MesClasseNode[] {
    const f = this.filterForm?.value;
    if (!f || (!f.classeId && !f.matiereId && !f.anneeId && !f.semestreId && !f.statut)) return this.classeNodes;
    return this.classeNodes
      .map(cn => ({
        ...cn,
        matieres: cn.matieres.filter(mn => {
          const r = mn.releve;
          if (!r) return false;
          if (f.classeId   && r.classeId          !== +f.classeId)   return false;
          if (f.matiereId  && r.matiereId         !== +f.matiereId)  return false;
          if (f.anneeId    && r.anneeAcademiqueId !== +f.anneeId)    return false;
          if (f.semestreId && r.semestreId        !== +f.semestreId) return false;
          if (f.statut     && r.statut            !== f.statut)      return false;
          return true;
        })
      }))
      .filter(cn => cn.matieres.length > 0);
  }

  constructor(
    private svc:    SaisieNotesService,
    private fb:     FormBuilder,
    private cdr:    ChangeDetectorRef,
    public  router: Router
  ) {}

  ngOnInit(): void { this.initForm(); this.chargerReferentiels(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private initForm(): void {
    this.filterForm = this.fb.group({
      classeId: [null], matiereId: [null],
      semestreId: [null], anneeId: [null], statut: [null]
    });
    this.filterForm.get('classeId')!.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(cId => {
        this.filterForm.patchValue({ matiereId: null }, { emitEvent: false });
        this.matieresFiltrees = [];
        if (!cId) return;
        this.loadingMatieres = true;
        this.svc.getMesMatieresParClasse(+cId)
          .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingMatieres = false)))
          .subscribe(d => { this.matieresFiltrees = d; this.cdr.markForCheck(); });
      });
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(200))
      .subscribe(() => { this.pageActuelle = 1; this.cdr.markForCheck(); });
  }

  // ── CHARGEMENT ─────────────────────────────────────────────

  private chargerReferentiels(): void {
    this.loading = true;
    forkJoin({ classes: this.svc.getMesClasses(), annees: this.svc.getAllAnneacademique() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ref => { this.classes = ref.classes; this.annees = ref.annees; this.chargerReleves(); },
        error: () => { this.loading = false; this.toast('error', 'Erreur chargement référentiels.'); }
      });
  }

  chargerReleves(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.svc.getToutesLesNotes()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: releves => {
          this.tousLesReleves = Array.isArray(releves) ? releves : [];
          this.classeNodes    = this.construireGroupes(this.tousLesReleves);
          const ids = [...new Set(this.tousLesReleves.map(r => r.matiereId))];
this.matieres = this.tousLesReleves.map(r => ({
  id: r.matiereId,
  intitule:
    (r as any).matiere?.nom ??
    (r as any).matiereNom ??
    `Matière #${r.matiereId}`
})) as Matiere[];        },
        error: () => { this.tousLesReleves = []; this.classeNodes = []; this.toast('error', 'Impossible de charger les relevés.'); }
      });
  }

  private construireGroupes(releves: SaisieNotes[]): MesClasseNode[] {
  const map = new Map<number, MesClasseNode>();

  releves.forEach(r => {

    if (!map.has(r.classeId)) {
      map.set(r.classeId, {
        classeId: r.classeId,
        classeNom: this.resolveClasseNom(r.classeId),
        nombreReleves: 0,
        matieres: [],
        expanded: false
      });
    }

    const cn = map.get(r.classeId)!;
    cn.nombreReleves++;

    cn.matieres.push({
      matiereId: r.matiereId,

      // ✅ récupération intelligente du nom
      matiereNom:
        (r as any).matiere?.nom ??
        (r as any).matiereNom ??
        this.resolveMatiereNom(r.matiereId),

      releve: r,
      lignes: [],
      expanded: false,
      loading: false,
      lignesChargees: false
    });

  });

  return Array.from(map.values())
    .sort((a, b) => a.classeNom.localeCompare(b.classeNom, 'fr'));
}

  // ── ✅ FUSION ÉTUDIANTS + LIGNES (même logique que saisie-note) ──────

  /**
   * Calcule la note finale côté front si le backend ne l'a pas fournie.
   * Règle : 40% Devoir + 60% max(Session, Rattrapage)
   */
  private calculerNoteFinale(nd: number | null, nso: number | null, nsr: number | null): number | null {
    if (nd === null && nso === null && nsr === null) return null;
    const D = 0.4, S = 0.6;
    let nf = 0;
    if      (nd !== null && nso === null && nsr === null) nf = nd * D;
    else if (nd === null  && nso !== null && nsr === null) nf = nso * S;
    else if (nd === null  && nso === null && nsr !== null) nf = nsr * S;
    else if (nd !== null && nso !== null && nsr === null) nf = nd * D + nso * S;
    else if (nd !== null && nso === null && nsr !== null) nf = nd * D + nsr * S;
    else if (nd === null  && nso !== null && nsr !== null) nf = Math.max(nso, nsr) * S;
    else if (nd !== null && nso !== null && nsr !== null) nf = nd * D + Math.max(nso, nsr) * S;
    return Math.min(Math.round(nf * 100) / 100, 20);
  }

  /**
   * ✅ Fusionne la liste des étudiants de la classe avec les lignes du relevé.
   * - etudiantNom  : depuis ligneNoteDto.etudiantNom OU nom+prenom de l'étudiant
   * - notes        : depuis ligneNoteDto, défaut 0 si absent
   * - noteFinale   : calculée si non fournie par le backend
   */
  private fusionner(etudiants: any[], lignesBackend: any[]): LigneAffichage[] {
    return etudiants.map(e => {
      const saved = lignesBackend.find((l: any) => l.etudiantId === e.id);
      const nd  = saved?.noteDevoir            ?? null;
      const nso = saved?.noteSessionOrdinaire  ?? null;
      const nsr = saved?.noteSessionRattrapage ?? null;
      const nf  = saved?.noteFinale            ?? this.calculerNoteFinale(nd, nso, nsr);
      const nom = (saved?.etudiantNom ?? `${e.nom ?? ''} ${e.prenom ?? ''}`.trim()) || `Étudiant #${e.id}`;
      return {
        etudiantId:            e.id,
        etudiantNom:           nom,
        noteDevoir:            nd,
        noteSessionOrdinaire:  nso,
        noteSessionRattrapage: nsr,
        noteFinale:            nf
      };
    });
  }

  // ── EXPAND ─────────────────────────────────────────────────

  toggleClasse(node: MesClasseNode): void { node.expanded = !node.expanded; }

  /**
   * ✅ FIX PRINCIPAL : forkJoin(étudiants + lignes) au lieu de lignes seules
   * → garantit etudiantNom, notes correctes, noteFinale calculée
   */
  toggleMatiere(mat: MesMatiereNode): void {
    mat.expanded = !mat.expanded;
    if (mat.expanded && !mat.lignesChargees && mat.releve?.id) {
      mat.loading = true;
      const classeId = mat.releve.classeId;
      const releveId = mat.releve.id;
      forkJoin({
        etudiants: this.svc.getEtudiantsNoteDtoParClasse(classeId),
        lignes:    this.svc.getLignesNotesParReleve(releveId)
      })
      .pipe(takeUntil(this.destroy$), finalize(() => { mat.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: ({ etudiants, lignes }) => {
          mat.lignes         = this.fusionner(etudiants, lignes as any[]);
          mat.lignesChargees = true;
          this.cdr.markForCheck();
        },
        error: () => {
          // fallback : lignes brutes sans fusion
          this.svc.getLignesNotesParReleve(releveId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(lignes => {
              mat.lignes = (lignes as any[]).map(l => ({
                etudiantId:            l.etudiantId,
                etudiantNom:           l.etudiantNom ?? `Étudiant #${l.etudiantId}`,
                noteDevoir:            l.noteDevoir            ?? null,
                noteSessionOrdinaire:  l.noteSessionOrdinaire  ?? null,
                noteSessionRattrapage: l.noteSessionRattrapage ?? null,
                noteFinale:            l.noteFinale ?? this.calculerNoteFinale(l.noteDevoir ?? null, l.noteSessionOrdinaire ?? null, l.noteSessionRattrapage ?? null)
              }));
              mat.lignesChargees = true;
              this.cdr.markForCheck();
            });
        }
      });
    }
  }

  developperTout(): void { this.classeNodes.forEach(n => (n.expanded = true)); this.cdr.markForCheck(); }
  reduireTout():    void {
    this.classeNodes.forEach(n => { n.expanded = false; n.matieres.forEach(m => (m.expanded = false)); });
    this.cdr.markForCheck();
  }

  // ── ACTIONS ────────────────────────────────────────────────

  modifierReleve(releve: SaisieNotes): void {
    if (!releve?.id) return;
    if (releve.verrouille) { this.toast('warning', '🔒 Ce relevé est verrouillé.'); return; }
    this.router.navigate(['/dashboard/enseignant/saisie-note'], { queryParams: { releveId: releve.id } });
  }

  supprimerReleve(releve: SaisieNotes): void {
    if (!releve?.id) return;
    if (releve.verrouille) { this.toast('error', '🔒 Relevé verrouillé — suppression impossible.'); return; }
    if (!confirm(`⚠️ Supprimer le relevé #${releve.id} ?`)) return;
    this.svc.supprimerReleve(releve.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.tousLesReleves = this.tousLesReleves.filter(r => r.id !== releve.id);
        this.classeNodes    = this.construireGroupes(this.tousLesReleves);
        this.toast('success', '✅ Relevé supprimé.');
        this.cdr.markForCheck();
      },
      error: err => this.toast('error', '❌ ' + (err?.error?.message ?? 'Échec'))
    });
  }

  // ── VISUALISATION ──────────────────────────────────────────

  /**
   * ✅ Charge les lignes fusionnées avant d'ouvrir la modal
   */
  visualiser(mat: MesMatiereNode): void {
    if (!mat.releve?.id) return;
    this.releveVisualise = mat.releve;

    if (mat.lignesChargees) {
      this.lignesVisualise = mat.lignes;
      return;
    }

    mat.loading = true;
    const classeId = mat.releve.classeId;
    const releveId = mat.releve.id;
    forkJoin({
      etudiants: this.svc.getEtudiantsNoteDtoParClasse(classeId),
      lignes:    this.svc.getLignesNotesParReleve(releveId)
    })
    .pipe(takeUntil(this.destroy$), finalize(() => { mat.loading = false; this.cdr.markForCheck(); }))
    .subscribe({
      next: ({ etudiants, lignes }) => {
        mat.lignes         = this.fusionner(etudiants, lignes as any[]);
        mat.lignesChargees = true;
        this.lignesVisualise = mat.lignes;
        this.cdr.markForCheck();
      }
    });
  }

  fermerVisualisation(): void { this.releveVisualise = null; this.lignesVisualise = []; }

  // ── FILTRES ────────────────────────────────────────────────

  reinitialiserFiltres(): void { this.filterForm.reset(); this.matieresFiltrees = []; this.pageActuelle = 1; }

  // ── TRI ────────────────────────────────────────────────────

  trier(col: TriCol): void {
    if (this.triColonne === col) { this.triAscendant = !this.triAscendant; }
    else { this.triColonne = col; this.triAscendant = true; }
  }
  private valeurTri(r: SaisieNotes): string {
    switch (this.triColonne) {
      case 'classe':  return this.resolveClasseNom(r.classeId);
      case 'matiere': return this.resolveMatiereNom(r.matiereId);
      case 'statut':  return r.statut ?? '';
      default:        return '';
    }
  }
  triIcon(col: TriCol): string { if (this.triColonne !== col) return '↕'; return this.triAscendant ? '↑' : '↓'; }

  // ── EXPORT ─────────────────────────────────────────────────

  toggleExportMenu(): void { this.showExportMenu = !this.showExportMenu; }
  closeExportMenu():  void { this.showExportMenu  = false; }

  private buildExportRows(): object[] {
    const rows: object[] = [];
    this.classeNodesFiltres.flatMap(cn => cn.matieres).forEach(mn => {
      const base = {
        'Classe':     mn.releve ? this.resolveClasseNom(mn.releve.classeId) : '—',
        'Matière':    mn.matiereNom,
        'Année':      this.resolveAnneeLabel(mn.releve?.anneeAcademiqueId ?? 0),
        'Semestre':   `S${mn.releve?.semestreId ?? '?'}`,
        'Statut':     this.statutLabel(mn.releve?.statut),
        'Verrouillé': mn.releve?.verrouille ? 'Oui' : 'Non'
      };
      if (mn.lignes.length) {
        mn.lignes.forEach(l => rows.push({
          ...base,
          'Étudiant':    l.etudiantNom,
          'Devoir':      l.noteDevoir            ?? 0,
          'Session':     l.noteSessionOrdinaire  ?? 0,
          'Rattrapage':  l.noteSessionRattrapage ?? 0,
          'Note finale': l.noteFinale            ?? 0,
          'Mention':     this.getMention(l.noteFinale)
        }));
      } else {
        rows.push({ ...base, 'Étudiant': '—', 'Devoir': 0, 'Session': 0, 'Rattrapage': 0, 'Note finale': 0, 'Mention': '—' });
      }
    });
    return rows;
  }

  exporterExcel(): void {
    const rows = this.buildExportRows();
    if (!rows.length) { this.toast('warning', '⚠️ Aucune donnée'); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Array(Object.keys(rows[0]).length).fill({ wch: 18 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mes Relevés');
    XLSX.writeFile(wb, `MesReleves_${this.today()}.xlsx`);
    this.closeExportMenu(); this.toast('success', '📊 Excel exporté');
  }

  exporterCSV(): void {
    const rows = this.buildExportRows();
    if (!rows.length) { this.toast('warning', '⚠️ Aucune donnée'); return; }
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(rows));
    saveAs(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), `MesReleves_${this.today()}.csv`);
    this.closeExportMenu(); this.toast('success', '📁 CSV exporté');
  }

  exporterPDF(): void {
    const rows = this.buildExportRows();
    if (!rows.length) { this.toast('warning', '⚠️ Aucune donnée'); return; }
    const doc  = new jsPDF({ orientation: 'landscape' });
    const cols = Object.keys(rows[0]);
    doc.setFillColor(10, 14, 26); doc.rect(0, 0, 297, 28, 'F');
    doc.setFontSize(13); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text('MES RELEVÉS DE NOTES', 148, 10, { align: 'center' });
    doc.setFontSize(8); doc.setTextColor(148, 163, 184); doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 148, 19, { align: 'center' });
    autoTable(doc, {
      startY: 30, head: [cols],
      body: rows.map(r => cols.map(c => String((r as any)[c] ?? 0))),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 6.5 },
      alternateRowStyles: { fillColor: [244, 247, 252] },
      margin: { left: 8, right: 8 }
    });
    doc.save(`MesReleves_${this.today()}.pdf`);
    this.closeExportMenu(); this.toast('success', '📄 PDF exporté');
  }

  // ── IMPRESSION ─────────────────────────────────────────────

  imprimerParClasse(node: MesClasseNode): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    node.matieres.forEach((mat, idx) => {
      if (idx > 0) doc.addPage();
      this.genererPageOfficielle(doc, mat.releve, mat.lignes, node.classeNom, mat.matiereNom);
    });
    this.ouvrirImpression(doc);
    this.toast('info', `🖨 Impression — ${node.classeNom}`);
  }

  imprimerParMatiere(mat: MesMatiereNode): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.genererPageOfficielle(
      doc, mat.releve, mat.lignes,
      this.resolveClasseNom(mat.releve?.classeId ?? 0),
      mat.matiereNom
    );
    this.ouvrirImpression(doc);
    this.toast('info', `🖨 Impression — ${mat.matiereNom}`);
  }

  private genererPageOfficielle(
    doc: jsPDF, releve: SaisieNotes | null,
    lignes: LigneAffichage[], classeNom: string, matiereNom: string
  ): void {
    const pw = doc.internal.pageSize.getWidth();
    doc.setFillColor(253, 250, 240); doc.rect(0, 0, pw, 297, 'F');
    doc.setDrawColor(180, 150, 80); doc.setLineWidth(1.2); doc.rect(6, 6, pw - 12, 285);
    doc.setLineWidth(0.4); doc.rect(8, 8, pw - 16, 281);
    doc.setFillColor(79, 70, 229); doc.circle(20, 22, 8, 'F');
    doc.setFontSize(6); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text('SGES', 20, 23.5, { align: 'center' });
    doc.setFontSize(9); doc.setTextColor(30, 30, 80); doc.setFont('helvetica', 'bold');
    doc.text('RELEVÉ DE NOTES — ENSEIGNANT', pw / 2, 15, { align: 'center' });
    doc.setFontSize(12); doc.setTextColor(15, 23, 42);
    doc.text('CLASSE : ' + classeNom.toUpperCase(), pw / 2, 23, { align: 'center' });
    doc.setFontSize(8); doc.setTextColor(80, 80, 130);
    doc.text(`N° Relevé : RN-${releve?.id ?? '?'}`, pw / 2, 30, { align: 'center' });
    doc.setDrawColor(180, 150, 80); doc.setLineWidth(0.5); doc.line(12, 33, pw - 12, 33);
    let y = 40;
    const meta: [string, string][] = [
      ['Matière :',  matiereNom],
      ['Classe :',   classeNom],
      ['Année :',    this.resolveAnneeLabel(releve?.anneeAcademiqueId ?? 0)],
      ['Semestre :', `S${releve?.semestreId ?? '?'}`]
    ];
    meta.forEach(([lb, v]) => {
      doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 120); doc.setFontSize(8); doc.text(lb, 14, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(15, 23, 42); doc.text(v, 48, y); y += 6;
    });
    const sc: [number, number, number] = releve?.statut === 'VALIDE' ? [21, 128, 61] : releve?.statut === 'REJETE' ? [185, 28, 28] : [180, 120, 0];
    doc.setFillColor(...sc);
    doc.roundedRect(pw - 44, 39, 30, 8, 2, 2, 'F');
    doc.setFontSize(7); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text(this.statutLabel(releve?.statut).toUpperCase(), pw - 29, 44.5, { align: 'center' });
    const tY = y + 2;
    doc.setDrawColor(180, 150, 80); doc.setLineWidth(0.4); doc.line(12, tY, pw - 12, tY);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(79, 70, 229);
    doc.text('DÉTAIL DES NOTES — ' + matiereNom.toUpperCase(), pw / 2, tY + 6, { align: 'center' });
    autoTable(doc, {
      startY: tY + 9,
      head: [['N°', 'Étudiant', 'Devoir', 'Session', 'Rattrapage', 'Note Finale', 'Mention']],
      body: lignes.map((l, i) => [
        String(i + 1), l.etudiantNom,
        String(l.noteDevoir ?? 0),
        String(l.noteSessionOrdinaire ?? 0),
        String(l.noteSessionRattrapage ?? 0),
        String(l.noteFinale ?? 0),
        this.getMention(l.noteFinale)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'center' },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center', fontStyle: 'bold' }, 6: { halign: 'center' } },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      margin: { left: 12, right: 12 }
    });
    const fy: number = (doc as any).lastAutoTable?.finalY ?? 250;
    doc.setFontSize(6.5); doc.setTextColor(120, 120, 120); doc.setFont('helvetica', 'normal');
    doc.text(`Créé le : ${releve?.dateCreation ? this.formatDate(String(releve.dateCreation)) : '—'}`, 14, fy + 8);
    doc.setDrawColor(180, 150, 80); doc.setLineWidth(0.4); doc.line(12, fy + 17, pw - 12, fy + 17);
    doc.setFontSize(6); doc.setTextColor(150, 150, 150);
    doc.text('Document généré automatiquement par le SGES', pw / 2, fy + 22, { align: 'center' });
  }

  private ouvrirImpression(doc: jsPDF): void {
    const blob = doc.output('blob'); const url = URL.createObjectURL(blob); const win = window.open(url);
    if (win) win.addEventListener('load', () => { win.focus(); win.print(); }, { once: true });
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  // ── RÉSOLUTION NOMS ────────────────────────────────────────

  resolveClasseNom(id: number):  string { const c = this.classes.find(x => x.id === id); return c ? (c.code ?? `Classe #${id}`) : `Classe #${id}`; }
  resolveMatiereNom(id: number): string { const m = this.matieres.find(x => x.id === id); return m ? (m.intitule ?? m.code ?? `Matière #${id}`) : `Matière #${id}`; }
  resolveAnneeLabel(id: number): string { const a = this.annees.find(x => x.id === id); return a ? (a.libelle ?? `Année #${id}`) : (id ? `Année #${id}` : '—'); }

  getMatiereNodeByReleve(r: SaisieNotes | null): MesMatiereNode {
    if (!r) return { matiereId: 0, matiereNom: '', releve: null, lignes: [], expanded: false, loading: false, lignesChargees: false };
    for (const cn of this.classeNodes) { const f = cn.matieres.find(m => m.releve?.id === r.id); if (f) return f; }
    return { matiereId: r.matiereId, matiereNom: (r as any).matiere?.nom
          ?? (r as any).matiereNom
          ?? this.resolveMatiereNom(r.matiereId), releve: r, lignes: [], expanded: false, loading: false, lignesChargees: false };
  }

  // ── HELPERS ────────────────────────────────────────────────

  statutLabel(statut?: string | null): string {
    return statut ? ({ EN_ATTENTE: 'En attente', VALIDE: 'Validé', REJETE: 'Rejeté' }[statut] ?? statut) : '—';
  }
  statutClass(statut?: string | null): string {
    return statut ? ({ EN_ATTENTE: 'badge-attente', VALIDE: 'badge-valide', REJETE: 'badge-rejete' }[statut] ?? '') : '';
  }

  getMention(note?: number | null): string {
    if (note == null) return '—';
    if (note >= 16) return 'Très Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Admis';
    return 'Ajourné';
  }
  mentionClass(note?: number | null): string {
    if (note == null) return '';
    if (note >= 16) return 'mention-tb';
    if (note >= 14) return 'mention-b';
    if (note >= 12) return 'mention-ab';
    if (note >= 10) return 'mention-admis';
    return 'mention-ajourne';
  }
  formatDate(iso?: string | null): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  }
  minVal(a: number, b: number): number { return Math.min(a, b); }
  private today(): string { return new Date().toISOString().slice(0, 10); }

  trackByClasseId(_: number, n: MesClasseNode):  number { return n.classeId; }
  trackByMatiereId(_: number, m: MesMatiereNode): number { return m.matiereId; }
  trackByReleveId(_: number, r: SaisieNotes):    number { return r.id ?? 0; }
  trackByLigneId(_: number, l: LigneAffichage):  number { return l.etudiantId; }

  private toast(type: Toast['type'], message: string): void {
    const id = ++this._tid; this.toasts = [...this.toasts, { id, type, message }];
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }, 4500);
  }
  dismissToast(id: number): void { this.toasts = this.toasts.filter(t => t.id !== id); }
}