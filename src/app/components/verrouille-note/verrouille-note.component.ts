// ================================================================
// 🔥 VERROUILLE-NOTE COMPONENT — FINAL 2026
// ✅ Fix 1 : verrouillerClasse extrait anneeId/semestreId des relevés
// ✅ Fix 2 : etudiantNom affiché depuis les lignes
// ✅ Fix 3 : visualiser/export/imprimer avec toutes les métadonnées
// ================================================================

import {
  Component, OnInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { Subject, forkJoin, of } from 'rxjs';
import {
  takeUntil, catchError, finalize, debounceTime, distinctUntilChanged
} from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  ReleveNotesAdminService,
  ReleveNotesDto, LigneNoteDto,
  ClasseReleveGroupDto, ClasseDto, MatiereDto,
  AnneeAcademiqueDto, SemestreDto, StatutReleve
} from 'src/app/services/verrouille-note.service';

export interface MatiereNode {
  matiereId: number; matiereNom: string;
  releve: ReleveNotesDto | null;
  lignes: LigneNoteDto[];
  expanded: boolean; loading: boolean; lignesChargees: boolean;
}

export interface ClasseNode {
  classeId: number; classeNom: string;
  toutVerrouille: boolean;
  nombreReleves: number; nombreVerrouilles: number;
  matieres: MatiereNode[];
  expanded: boolean; loading: boolean;
}

export type VuePivot   = 'classe' | 'matiere';
export type TriColonne = 'classeNom' | 'matiereNom' | 'statut' | 'verrouille' | null;
interface Toast { id: number; type: 'success'|'error'|'info'|'warning'; message: string; }

@Component({
  selector: 'app-verrouille-note',
  templateUrl: './verrouille-note.component.html',
  styleUrls:   ['./verrouille-note.component.scss']
})
export class VerrouilleNoteComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private _tid = 0;

  classeNodes:    ClasseNode[]     = [];
  tousLesReleves: ReleveNotesDto[] = [];
  classes:   ClasseDto[]          = [];
  matieres:  MatiereDto[]         = [];
  annees:    AnneeAcademiqueDto[] = [];
  semestres: SemestreDto[]        = [];

  loading = false;
  loadingLock: Record<number, boolean> = {};
  loadingMatieres = false;

  vuePivot:        VuePivot   = 'classe';
  triColonne:      TriColonne = null;
  triAscendant:    boolean    = true;
  filterForm!:     FormGroup;
  matieresFiltrees: MatiereDto[] = [];

  pageActuelle = 1;
  pageSize     = 15;

  toasts:          Toast[]               = [];
  showExportMenu   = false;
  releveVisualise: ReleveNotesDto | null = null;

  get totalReleves():     number { return this.tousLesReleves.length; }
  get totalVerrouilles(): number { return this.tousLesReleves.filter(r => r.verrouille).length; }
  get totalValides():     number { return this.tousLesReleves.filter(r => r.statut === 'VALIDE').length; }
  get totalAttente():     number { return this.tousLesReleves.filter(r => r.statut === 'EN_ATTENTE').length; }

  get relevesFiltres(): ReleveNotesDto[] {
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
        const cmp = String(this.valeurTri(a)).localeCompare(String(this.valeurTri(b)), 'fr');
        return this.triAscendant ? cmp : -cmp;
      });
    }
    return list;
  }

  get totalPages():     number { return Math.max(1, Math.ceil(this.relevesFiltres.length / this.pageSize)); }
  get relevesPagines(): ReleveNotesDto[] {
    const s = (this.pageActuelle - 1) * this.pageSize;
    return this.relevesFiltres.slice(s, s + this.pageSize);
  }
  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = Math.max(1, this.pageActuelle - 2); i <= Math.min(this.totalPages, this.pageActuelle + 2); i++) pages.push(i);
    return pages;
  }

  constructor(private svc: ReleveNotesAdminService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  // ── LIFECYCLE ────────────────────────────────────────────────

  ngOnInit(): void { this.initForm(); this.chargerReferentiels(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private initForm(): void {
    this.filterForm = this.fb.group({ classeId: [null], matiereId: [null], semestreId: [null], anneeId: [null], statut: [null] });

    this.filterForm.get('classeId')!.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(cId => {
        this.filterForm.patchValue({ matiereId: null }, { emitEvent: false });
        this.matieresFiltrees = [];
        if (!cId) return;
        this.loadingMatieres = true;
        this.svc.getMatieresParClasse(+cId)
          .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingMatieres = false)))
          .subscribe(d => (this.matieresFiltrees = d));
      });

    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => { this.pageActuelle = 1; });
  }

  // ── CHARGEMENT ───────────────────────────────────────────────

  private chargerReferentiels(): void {
    this.loading = true;
    forkJoin({ classes: this.svc.getAllClasses(), matieres: this.svc.getAllMatieres(), annees: this.svc.getAllAnnees(), semestres: this.svc.getAllSemestres() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ref => { this.classes = ref.classes; this.matieres = ref.matieres; this.annees = ref.annees; this.semestres = ref.semestres; this.chargerGroupes(); },
        error: () => { this.loading = false; this.toast('error', 'Erreur référentiels.'); }
      });
  }

  chargerGroupes(): void {
    this.loading = true;
    const f = this.filterForm?.value;
    const anneeId    = f?.anneeId    ? +f.anneeId    : null;
    const semestreId = f?.semestreId ? +f.semestreId : null;

    this.svc.getGroupes(anneeId, semestreId)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loading = false)))
      .subscribe({
        next: groupes => { this.tousLesReleves = groupes.flatMap(g => g.releves); this.classeNodes = groupes.map(g => this.buildClasseNode(g)); },
        error: () => {
          this.svc.getAll().pipe(takeUntil(this.destroy$)).subscribe(releves => {
            this.tousLesReleves = releves;
            this.classeNodes = this.svc.construireGroupesDepuisReleves(releves, anneeId, semestreId).map(g => this.buildClasseNode(g));
          });
        }
      });
  }

  private buildClasseNode(g: ClasseReleveGroupDto): ClasseNode {
    return { classeId: g.classeId, classeNom: g.classeNom || this.resolveClasseNom(g.classeId), toutVerrouille: g.toutVerrouille, nombreReleves: g.nombreReleves, nombreVerrouilles: g.nombreVerrouilles, expanded: false, loading: false, matieres: g.releves.map(r => this.buildMatiereNode(r)) };
  }

  private buildMatiereNode(r: ReleveNotesDto): MatiereNode {
    return { matiereId: r.matiereId, matiereNom: r.matiereNom || this.resolveMatiereNom(r.matiereId), releve: r, lignes: r.lignes ?? [], expanded: false, loading: false, lignesChargees: (r.lignes?.length ?? 0) > 0 };
  }

  // ── EXPAND ───────────────────────────────────────────────────

  toggleClasse(node: ClasseNode): void { node.expanded = !node.expanded; }

  toggleMatiere(mat: MatiereNode): void {
    mat.expanded = !mat.expanded;
    if (mat.expanded && !mat.lignesChargees && mat.releve?.id) {
      mat.loading = true;
      this.svc.getLignesParReleve(mat.releve.id)
        .pipe(takeUntil(this.destroy$), finalize(() => (mat.loading = false)))
        .subscribe(lignes => { mat.lignes = lignes; mat.lignesChargees = true; if (mat.releve) mat.releve.lignes = lignes; });
    }
  }

  developperTout(): void { this.classeNodes.forEach(n => (n.expanded = true)); }
  reduireTout():    void { this.classeNodes.forEach(n => { n.expanded = false; n.matieres.forEach(m => (m.expanded = false)); }); }

  // ── ✅ FIX 1 : VERROUILLAGE avec extraction auto anneeId/semestreId ──

  /**
   * Résout anneeId et semestreId :
   * 1. Depuis les filtres du formulaire
   * 2. Sinon depuis le premier relevé du nœud classe (sans contraindre l'utilisateur)
   */
  private resolveAnneeEtSemestre(node: ClasseNode): { anneeId: number | null; semestreId: number | null } {
    const f          = this.filterForm?.value;
    let anneeId    = f?.anneeId    ? +f.anneeId    : null;
    let semestreId = f?.semestreId ? +f.semestreId : null;

    // ✅ Fallback : extraire depuis les relevés existants du nœud
    if ((!anneeId || !semestreId) && node.matieres.length > 0) {
      const premier = node.matieres.find(m => m.releve != null)?.releve;
      if (premier) {
        anneeId    = anneeId    ?? premier.anneeAcademiqueId ?? null;
        semestreId = semestreId ?? premier.semestreId        ?? null;
      }
    }
    return { anneeId, semestreId };
  }

  verrouillerClasse(node: ClasseNode): void {
    const { anneeId, semestreId } = this.resolveAnneeEtSemestre(node);
    if (!anneeId || !semestreId) { this.toast('warning', '⚠️ Impossible de déterminer l\'année/semestre.'); return; }

    this.loadingLock[node.classeId] = true;
    this.svc.verrouillerClasse(node.classeId, anneeId, semestreId)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingLock[node.classeId] = false)))
      .subscribe({
        next: mis => {
          mis.forEach(maj => { const mat = node.matieres.find(m => m.releve?.id === maj.id); if (mat?.releve) Object.assign(mat.releve, maj); });
          node.toutVerrouille = true; node.nombreVerrouilles = node.nombreReleves;
          this.tousLesReleves = this.tousLesReleves.map(r => r.classeId === node.classeId ? { ...r, verrouille: true } : r);
          this.toast('success', `🔒 Classe "${node.classeNom}" — ${mis.length} matière(s) verrouillée(s).`);
        },
        error: (err) => this.toast('error', err?.error?.message ?? 'Erreur verrouillage.')
      });
  }

  deverrouillerClasse(node: ClasseNode): void {
    const { anneeId, semestreId } = this.resolveAnneeEtSemestre(node);
    if (!anneeId || !semestreId) { this.toast('warning', '⚠️ Impossible de déterminer l\'année/semestre.'); return; }

    this.loadingLock[node.classeId] = true;
    this.svc.deverrouillerClasse(node.classeId, anneeId, semestreId)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingLock[node.classeId] = false)))
      .subscribe({
        next: mis => {
          mis.forEach(maj => { const mat = node.matieres.find(m => m.releve?.id === maj.id); if (mat?.releve) Object.assign(mat.releve, maj); });
          node.toutVerrouille = false; node.nombreVerrouilles = 0;
          this.tousLesReleves = this.tousLesReleves.map(r => r.classeId === node.classeId ? { ...r, verrouille: false } : r);
          this.toast('success', `🔓 Classe "${node.classeNom}" — ${mis.length} matière(s) déverrouillée(s).`);
        },
        error: () => this.toast('error', 'Erreur déverrouillage.')
      });
  }

  verrouillerReleve(mat: MatiereNode, node: ClasseNode): void {
    if (!mat.releve?.id) return;
    this.svc.verrouiller(mat.releve.id).subscribe({
      next: maj => { Object.assign(mat.releve!, maj); node.nombreVerrouilles++; node.toutVerrouille = node.nombreVerrouilles === node.nombreReleves; this.syncReleve(maj); this.toast('success', `🔒 "${mat.matiereNom}" verrouillée.`); },
      error: () => this.toast('error', 'Erreur verrouillage.')
    });
  }

  deverrouillerReleve(mat: MatiereNode, node: ClasseNode): void {
    if (!mat.releve?.id) return;
    this.svc.deverrouiller(mat.releve.id).subscribe({
      next: maj => { Object.assign(mat.releve!, maj); node.nombreVerrouilles = Math.max(0, node.nombreVerrouilles - 1); node.toutVerrouille = false; this.syncReleve(maj); this.toast('success', `🔓 "${mat.matiereNom}" déverrouillée.`); },
      error: () => this.toast('error', 'Erreur déverrouillage.')
    });
  }

  verrouillerDirecte(r: ReleveNotesDto): void {
    if (!r.id) return;
    this.svc.verrouiller(r.id).subscribe({ next: maj => { this.syncReleve(maj); this.toast('success', '🔒 Verrouillé.'); }, error: () => this.toast('error', 'Erreur.') });
  }

  deverrouillerDirecte(r: ReleveNotesDto): void {
    if (!r.id) return;
    this.svc.deverrouiller(r.id).subscribe({ next: maj => { this.syncReleve(maj); this.toast('success', '🔓 Déverrouillé.'); }, error: () => this.toast('error', 'Erreur.') });
  }

  private syncReleve(maj: ReleveNotesDto): void {
    this.tousLesReleves = this.tousLesReleves.map(r => r.id === maj.id ? { ...r, ...maj } : r);
  }

  // ── VALIDATION ───────────────────────────────────────────────

  validerReleve(mat: MatiereNode): void {
    if (!mat.releve?.id) return;
    this.svc.valider(mat.releve.id).subscribe({ next: maj => { Object.assign(mat.releve!, maj); this.syncReleve(maj); this.toast('success', '✅ Relevé validé.'); }, error: () => this.toast('error', 'Erreur.') });
  }

  rejeterReleve(mat: MatiereNode): void {
    if (!mat.releve?.id) return;
    this.svc.rejeter(mat.releve.id).subscribe({ next: maj => { Object.assign(mat.releve!, maj); this.syncReleve(maj); this.toast('warning', '❌ Relevé rejeté.'); }, error: () => this.toast('error', 'Erreur.') });
  }

  // ── VISUALISATION ─────────────────────────────────────────────

  visualiser(mat: MatiereNode): void {
    if (!mat.releve?.id) return;
    this.svc.getById(mat.releve.id).subscribe({
      next: r => { mat.lignes = r.lignes; mat.lignesChargees = true; mat.releve = r; this.releveVisualise = r; },
      error: () => this.toast('error', 'Impossible de charger le détail.')
    });
  }

  fermerVisualisation(): void { this.releveVisualise = null; }

  // ── FILTRES ──────────────────────────────────────────────────

  reinitialiserFiltres(): void { this.filterForm.reset(); this.matieresFiltrees = []; this.pageActuelle = 1; }
  appliquerFiltres():     void { this.chargerGroupes(); }

  // ── TRI ──────────────────────────────────────────────────────

  trier(col: TriColonne): void {
    if (this.triColonne === col) { this.triAscendant = !this.triAscendant; } else { this.triColonne = col; this.triAscendant = true; }
  }
  private valeurTri(r: ReleveNotesDto): string {
    switch (this.triColonne) {
      case 'classeNom':  return r.classeNom  ?? String(r.classeId);
      case 'matiereNom': return r.matiereNom ?? String(r.matiereId);
      case 'statut':     return r.statut;
      case 'verrouille': return r.verrouille ? '1' : '0';
      default:           return '';
    }
  }
  triIcon(col: TriColonne): string { if (this.triColonne !== col) return '↕'; return this.triAscendant ? '↑' : '↓'; }

  // ── IMPORT ───────────────────────────────────────────────────

  importer(): void {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
      if (!file) return;
      this.svc.importer(file).pipe(takeUntil(this.destroy$), catchError(() => { this.toast('error', 'Erreur import'); return of(null); }))
        .subscribe(res => { if (res !== null) { this.toast('success', '📥 Import réussi !'); this.chargerGroupes(); } });
    };
    input.click();
  }

  // ── EXPORT ───────────────────────────────────────────────────

  toggleExportMenu(): void { this.showExportMenu = !this.showExportMenu; }
  closeExportMenu():  void { this.showExportMenu  = false; }

  private buildBaseRow(r: ReleveNotesDto | null, classeNom: string, matiereNom: string): Record<string, any> {
    return {
      'N° Relevé':          r?.id               ?? '—',
      'Classe':             classeNom,
      'Matière':            matiereNom,
      'Enseignant':         r?.enseignantNom     ?? '—',
      'Année académique':   this.resolveAnneeLabel(r?.anneeAcademiqueId ?? 0),
      'Semestre':           this.resolveSemestreLabel(r?.semestreId ?? 0),
      'Statut':             this.statutLabel(r?.statut),
      'Verrouillé':         r?.verrouille ? 'Oui' : 'Non',
      'Verrouillé par':     r?.verrouillePar     ?? '—',
      'Date verrouillage':  r?.dateVerrouillage  ? this.formatDate(r.dateVerrouillage) : '—',
      'Date création':      r?.dateCreation      ? this.formatDate(r.dateCreation)     : '—',
      'Date modification':  r?.dateModification  ? this.formatDate(r.dateModification) : '—',
    };
  }

  private buildLigneRow(l: LigneNoteDto | null): Record<string, any> {
    if (!l) return { 'Étudiant': '—', 'Devoir': '—', 'Session': '—', 'Rattrapage': '—', 'Note finale': '—', 'Mention': '—' };
    return {
      'Étudiant':    l.etudiantNom               ?? '—',
      'Devoir':      l.noteDevoir                ?? '—',
      'Session':     l.noteSessionOrdinaire      ?? '—',
      'Rattrapage':  l.noteSessionRattrapage     ?? '—',
      'Note finale': l.noteFinale                ?? '—',
      'Mention':     this.getMention(l.noteFinale)
    };
  }

  private buildExportRows(): object[] {
    const rows: object[] = [];
    const source = this.vuePivot === 'classe'
      ? this.classeNodes.flatMap(cn => cn.matieres.map(mn => ({ r: mn.releve, lignes: mn.lignes, cn: cn.classeNom, mn: mn.matiereNom })))
      : this.relevesFiltres.map(r => ({ r, lignes: r.lignes ?? [], cn: r.classeNom ?? '—', mn: r.matiereNom ?? '—' }));

    source.forEach(({ r, lignes, cn, mn }) => {
      const base = this.buildBaseRow(r, cn, mn);
      if (lignes?.length) lignes.forEach(l => rows.push({ ...base, ...this.buildLigneRow(l) }));
      else rows.push({ ...base, ...this.buildLigneRow(null) });
    });
    return rows;
  }

  exporterExcel(): void {
    const rows = this.buildExportRows();
    if (!rows.length) { this.toast('warning', '⚠️ Aucune donnée'); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Array(Object.keys(rows[0]).length).fill({ wch: 18 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relevés');
    XLSX.writeFile(wb, `Releves_${this.today()}.xlsx`);
    this.closeExportMenu(); this.toast('success', `📊 Excel exporté — ${rows.length} ligne(s)`);
  }

  exporterCSV(): void {
    const rows = this.buildExportRows();
    if (!rows.length) { this.toast('warning', '⚠️ Aucune donnée'); return; }
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(rows));
    saveAs(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), `Releves_${this.today()}.csv`);
    this.closeExportMenu(); this.toast('success', '📁 CSV exporté');
  }

  exporterPDF(): void {
    const rows = this.buildExportRows();
    if (!rows.length) { this.toast('warning', '⚠️ Aucune donnée'); return; }
    const doc  = new jsPDF({ orientation: 'landscape' });
    const cols = Object.keys(rows[0]);
    const body = rows.map(r => cols.map(c => String((r as any)[c] ?? '—')));
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 297, 28, 'F');
    doc.setFontSize(13); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
    doc.text('RELEVÉS DE NOTES — ADMINISTRATION', 148, 10, { align: 'center' });
    doc.setFontSize(8); doc.setTextColor(148,163,184); doc.setFont('helvetica','normal');
    doc.text(`Vue : ${this.vuePivot === 'classe' ? 'Par Classe' : 'Par Matière'}  ·  Généré le ${new Date().toLocaleDateString('fr-FR')}`, 148, 19, { align: 'center' });
    autoTable(doc, { startY: 30, head: [cols], body, theme: 'grid', headStyles: { fillColor: [79,70,229], textColor: 255, fontStyle: 'bold', fontSize: 7 }, bodyStyles: { fontSize: 6.5 }, alternateRowStyles: { fillColor: [244,247,252] }, margin: { left: 8, right: 8 } });
    const nb = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= nb; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(148,163,184); doc.text(`Page ${i}/${nb}`, doc.internal.pageSize.getWidth()/2, doc.internal.pageSize.getHeight()-5, { align: 'center' }); }
    doc.save(`Releves_${this.today()}.pdf`);
    this.closeExportMenu(); this.toast('success', '📄 PDF exporté');
  }

  // ── ✅ FIX 3 : IMPRESSION FORMAT RELEVÉ OFFICIEL ─────────────

  imprimerParClasse(node: ClasseNode): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    node.matieres.forEach((mat, idx) => {
      if (idx > 0) doc.addPage();
      this.genererPageOfficielle(doc, mat.releve, mat.lignes, node.classeNom, mat.matiereNom);
    });
    this.ouvrirImpression(doc);
    this.toast('info', `🖨 Impression — ${node.classeNom}`);
  }

  imprimerParMatiere(mat: MatiereNode): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.genererPageOfficielle(doc, mat.releve, mat.lignes, mat.releve?.classeNom ?? '—', mat.matiereNom);
    this.ouvrirImpression(doc);
    this.toast('info', `🖨 Impression — ${mat.matiereNom}`);
  }

  private genererPageOfficielle(doc: jsPDF, releve: ReleveNotesDto | null, lignes: LigneNoteDto[], classeNom: string, matiereNom: string): void {
    const pw = doc.internal.pageSize.getWidth();

    // Fond crème
    doc.setFillColor(253, 250, 240); doc.rect(0, 0, pw, 297, 'F');
    // Bordures doubles
    doc.setDrawColor(180,150,80); doc.setLineWidth(1.2); doc.rect(6,6,pw-12,285);
    doc.setLineWidth(0.4); doc.rect(8,8,pw-16,281);
    // Logo
    doc.setFillColor(79,70,229); doc.circle(20,22,8,'F');
    doc.setFontSize(6); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.text('SGES',20,23.5,{align:'center'});

    // En-tête
    doc.setFontSize(9); doc.setTextColor(30,30,80); doc.setFont('helvetica','bold');
    doc.text('SYSTÈME DE GESTION DES ÉTUDES SUPÉRIEURES', pw/2, 15, {align:'center'});
    doc.setFontSize(12); doc.setTextColor(15,23,42);
    doc.text('RELEVÉ DE NOTES — CLASSE : ' + classeNom.toUpperCase(), pw/2, 23, {align:'center'});
    doc.setFontSize(8); doc.setTextColor(80,80,130);
    doc.text(`N° du Relevé : RN-${releve?.id ?? '???'}`, pw/2, 30, {align:'center'});

    doc.setDrawColor(180,150,80); doc.setLineWidth(0.5); doc.line(12,33,pw-12,33);

    // Métadonnées gauche
    let y = 40;
    const metaG: [string, string][] = [
      ['Enseignant :', releve?.enseignantNom ?? '—'],
      ['Matière :', matiereNom],
      ['Classe :', classeNom],
      ['Année acad. :', this.resolveAnneeLabel(releve?.anneeAcademiqueId ?? 0)],
      ['Semestre :', this.resolveSemestreLabel(releve?.semestreId ?? 0)],
    ];
    metaG.forEach(([lb, v]) => {
      doc.setFont('helvetica','bold'); doc.setTextColor(80,80,120); doc.setFontSize(8); doc.text(lb,14,y);
      doc.setFont('helvetica','normal'); doc.setTextColor(15,23,42); doc.text(v,52,y); y+=6;
    });

    // Métadonnées droite
    let yr = 40;
    const metaD: [string, string][] = [
      ['Statut :', this.statutLabel(releve?.statut).toUpperCase()],
      ['Verrouillé :', releve?.verrouille ? '🔒 OUI' : '🔓 NON'],
      ['Date verrou. :', releve?.dateVerrouillage ? this.formatDate(releve.dateVerrouillage) : '—'],
      ['Verrouillé par :', releve?.verrouillePar ?? '—'],
      ['Créé le :', releve?.dateCreation ? this.formatDate(releve.dateCreation) : '—'],
    ];
    metaD.forEach(([lb, v]) => {
      doc.setFont('helvetica','bold'); doc.setTextColor(80,80,120); doc.setFontSize(8); doc.text(lb,pw/2+4,yr);
      doc.setFont('helvetica','normal'); doc.setTextColor(15,23,42); doc.text(v,pw/2+36,yr); yr+=6;
    });

    // Badge statut
    const sc = releve?.statut==='VALIDE' ? [21,128,61] : releve?.statut==='REJETE' ? [185,28,28] : [180,120,0];
    doc.setFillColor(...(sc as [number,number,number]));
    doc.roundedRect(pw-44,39,30,8,2,2,'F');
    doc.setFontSize(7); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
    doc.text(this.statutLabel(releve?.statut).toUpperCase(), pw-29, 44.5, {align:'center'});

    // Séparateur + titre tableau
    const tY = Math.max(y, yr) + 2;
    doc.setDrawColor(180,150,80); doc.setLineWidth(0.4); doc.line(12,tY,pw-12,tY);
    doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(79,70,229);
    doc.text('DÉTAIL DES RÉSULTATS — ' + matiereNom.toUpperCase(), pw/2, tY+6, {align:'center'});

    // Tableau notes
    autoTable(doc, {
      startY: tY+9,
      head: [['N°','Nom de l\'Étudiant','Devoir (30%)','Session (70%)','Rattrapage','Note Finale','Mention']],
      body: (lignes ?? []).map((l, i) => [
        String(i+1), l.etudiantNom ?? '—',
        l.noteDevoir        != null ? String(l.noteDevoir)               : '—',
        l.noteSessionOrdinaire  != null ? String(l.noteSessionOrdinaire) : '—',
        l.noteSessionRattrapage != null ? String(l.noteSessionRattrapage): '—',
        l.noteFinale        != null ? String(l.noteFinale)               : '—',
        this.getMention(l.noteFinale)
      ]),
      theme: 'grid',
      headStyles: { fillColor:[79,70,229], textColor:255, fontStyle:'bold', fontSize:8, halign:'center' },
      bodyStyles: { fontSize:8, textColor:[15,23,42] },
      columnStyles: {
        0:{halign:'center',cellWidth:10}, 2:{halign:'center'}, 3:{halign:'center'},
        4:{halign:'center'}, 5:{halign:'center',fontStyle:'bold',textColor:[79,70,229]}, 6:{halign:'center'}
      },
      alternateRowStyles: { fillColor:[245,247,255] },
      margin: { left:12, right:12 }
    });

    // Pied de page
    const fy = (doc as any).lastAutoTable?.finalY ?? 250;
    doc.setFontSize(6.5); doc.setTextColor(120,120,120); doc.setFont('helvetica','normal');
    doc.text(`Date création : ${releve?.dateCreation ? this.formatDate(releve.dateCreation) : '—'}`, 14, fy+8);
    doc.text(`Date modification : ${releve?.dateModification ? this.formatDate(releve.dateModification) : '—'}`, 14, fy+13);
    doc.setDrawColor(180,150,80); doc.setLineWidth(0.4); doc.line(12,fy+17,pw-12,fy+17);
    doc.setFontSize(6); doc.setTextColor(150,150,150);
    doc.text('Document généré automatiquement par le Système de Gestion des Études Supérieures (SGES)', pw/2, fy+22, {align:'center'});
  }

  private ouvrirImpression(doc: jsPDF): void {
    const blob = doc.output('blob'); const url = URL.createObjectURL(blob); const win = window.open(url);
    if (win) win.addEventListener('load', () => { win.focus(); win.print(); }, { once: true });
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  // ── RÉSOLUTION NOMS ──────────────────────────────────────────

  resolveClasseNom(id: number):   string { const c = this.classes.find(x => x.id===id); return c ? (c.nom ?? c.code ?? `Classe #${id}`) : `Classe #${id}`; }
  resolveMatiereNom(id: number):  string { const m = this.matieres.find(x => x.id===id); return m ? (m.intitule ?? m.nom ?? m.code ?? `Matière #${id}`) : `Matière #${id}`; }
  resolveAnneeLabel(id: number):  string { const a = this.annees.find(x => x.id===id); return a ? (a.libelle ?? a.annee ?? `Année #${id}`) : (id ? `Année #${id}` : '—'); }
  resolveSemestreLabel(id: number): string { const s = this.semestres.find(x => x.id===id); return s ? (s.libelle ?? `Semestre ${s.numero??id}`) : (id ? `Semestre #${id}` : '—'); }

  // ── HELPERS ──────────────────────────────────────────────────

  statutLabel(statut?: StatutReleve | null): string {
    return statut ? ({ EN_ATTENTE:'En attente', VALIDE:'Validé', REJETE:'Rejeté' }[statut] ?? statut) : '—';
  }
  statutClass(statut?: StatutReleve | null): string {
    return statut ? ({ EN_ATTENTE:'badge-attente', VALIDE:'badge-valide', REJETE:'badge-rejete' }[statut] ?? '') : '';
  }
  getMention(note?: number | null): string {
    if (note == null) return '—';
    if (note >= 16)   return 'Très Bien';
    if (note >= 14)   return 'Bien';
    if (note >= 12)   return 'Assez Bien';
    if (note >= 10)   return 'Admis';
    return 'Ajourné';
  }
  mentionClass(note?: number | null): string {
    if (note == null) return '';
    if (note >= 16)   return 'mention-tb';
    if (note >= 14)   return 'mention-b';
    if (note >= 12)   return 'mention-ab';
    if (note >= 10)   return 'mention-admis';
    return 'mention-ajourne';
  }
  formatDate(iso?: string | null): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch { return iso; }
  }
  minVal(a: number, b: number): number { return Math.min(a, b); }
  private today(): string { return new Date().toISOString().slice(0,10); }

  getMatiereNodeByReleve(r: ReleveNotesDto | null): MatiereNode {
    if (!r) return { matiereId:0, matiereNom:'', releve:null, lignes:[], expanded:false, loading:false, lignesChargees:false };
    for (const cn of this.classeNodes) { const f = cn.matieres.find(m => m.releve?.id===r.id); if (f) return f; }
    return { matiereId:r.matiereId, matiereNom:r.matiereNom??this.resolveMatiereNom(r.matiereId), releve:r, lignes:r.lignes??[], expanded:false, loading:false, lignesChargees:(r.lignes?.length??0)>0 };
  }

  trackByClasseId(_: number, n: ClasseNode):     number { return n.classeId; }
  trackByMatiereId(_: number, m: MatiereNode):   number { return m.matiereId; }
  trackByReleveId(_: number, r: ReleveNotesDto): number { return r.id ?? 0; }
  trackByLigneId(_: number, l: LigneNoteDto):    number { return l.id ?? l.etudiantId ?? 0; }

  private toast(type: Toast['type'], message: string): void {
    const id = ++this._tid; this.toasts = [...this.toasts, { id, type, message }];
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 4500);
  }
  dismissToast(id: number): void { this.toasts = this.toasts.filter(t => t.id !== id); }
}