// ======================================================
// 🔥 SAISIE-NOTE COMPONENT — ULTRA PREMIUM 2026
// ✅ Reconnexion  : cherche dans mesReleves en cache → lignes backend
// ✅ Modifier     : forkJoin direct sur getLignesNotesParReleve
// ✅ Export/Print : lignes rechargées depuis backend (pas releve.lignes)
// ======================================================

import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  finalize
} from 'rxjs/operators';
import { forkJoin, Subject, of } from 'rxjs';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Classe }          from 'src/app/models/classe';
import { Matiere }         from 'src/app/models/matiere';
import { LigneNote }       from 'src/app/models/ligne-note';
import { SaisieNotes }     from 'src/app/models/saisie-notes';
import { AnneeAcademique } from 'src/app/models/annee-academique';
import { StatutReleve }    from 'src/app/models/statut-releve';
import { ActivatedRoute } from '@angular/router';

import { SaisieNotesService } from 'src/app/services/saisie-notes.service';

@Component({
  selector: 'app-saisie-note',
  templateUrl: './saisie-note.component.html',
  styleUrls: ['./saisie-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaisieNoteComponent implements OnInit, OnDestroy {

  form!: FormGroup;

  classes:  Classe[]          = [];
  matieres: Matiere[]         = [];
  annees:   AnneeAcademique[] = [];
  lignes:   LigneNote[]       = [];

  loading    = false;
  saving     = false;
  validating = false;

  currentPage = 1;
  pageSize    = 10;

  showExportMenu = false;
  showImportMenu = false;

  mesReleves:        SaisieNotes[] = [];
  mesRelevesLoading  = false;
  showMesReleves     = true;
  mesRelevesPage     = 1;
  mesRelevesPageSize = 5;

  releveId:        number | null = null;
  releveValide     = false;
  releveVerrouille = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb:                 FormBuilder,
    private saisieNotesService: SaisieNotesService,
    private cdr:                ChangeDetectorRef,
    private route:       ActivatedRoute      // ← AJOUTER si absent
  ) {}

  // ════════════════════════════════════════════════════
  // ─────────────────────────────────────────────────────────────
// APRÈS (robuste) — remplacer ngOnInit() par ceci :
// ─────────────────────────────────────────────────────────────
ngOnInit(): void {
  this.initForm();
  this.loadReferentiels();
  this.loadEnseignantConnecte();

  this.chargerMesReleves(() => {
    this.listenChanges();

    // ✅ Observable queryParamMap : capte aussi le releveId après
    //    un retour de login (navigateByUrl(returnUrl))
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const releveIdStr = params.get('releveId');
        if (releveIdStr) {
          this.chargerRelevePourModification(+releveIdStr);
        }
      });
  });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ════════════════════════════════════════════════════
  // 🧱 INIT FORMULAIRE
  // ════════════════════════════════════════════════════
  private initForm(): void {
    this.form = this.fb.group({
      enseignantId:      [{ value: null, disabled: true }],
      classeId:          [null, Validators.required],
      matiereId:         [null, Validators.required],
      anneeAcademiqueId: [null, Validators.required],
      semestreId:        [{ value: null, disabled: true }, Validators.required],
      lignes:            this.fb.array([])
    });
  }

  // ════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════
  get lignesForm(): FormArray { return this.form.get('lignes') as FormArray; }

  get semestre(): string {
    const mat = this.matieres.find(m => m.id === this.form.get('matiereId')!.value);
    return mat ? `Semestre ${mat.semestreId}` : '';
  }
  get selectedClasse():  string { return this.classes.find(c  => c.id  === this.form.get('classeId')!.value)?.code      || ''; }
  get selectedMatiere(): string { return this.matieres.find(m => m.id  === this.form.get('matiereId')!.value)?.intitule || ''; }
  get selectedAnnee():   string { return this.annees.find(a   => a.id  === this.form.get('anneeAcademiqueId')!.value)?.libelle || ''; }

  // ════════════════════════════════════════════════════
  // PAGINATION
  // ════════════════════════════════════════════════════
  totalPages(): number { return Math.ceil(this.lignes.length / this.pageSize) || 1; }

  getPageNumbers(): number[] {
    const total = this.totalPages(), current = this.currentPage, delta = 2;
    const range: number[] = [], out: number[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) range.push(i);
    if (current - delta > 2) out.push(1, -1); else out.push(1);
    out.push(...range);
    if (current + delta < total - 1) out.push(-1, total); else if (total > 1) out.push(total);
    return out;
  }

  firstPage(e: Event): void { e.preventDefault(); this.currentPage = 1; }
  prevPage (e: Event): void { e.preventDefault(); if (this.currentPage > 1) this.currentPage--; }
  nextPage (e: Event): void { e.preventDefault(); if (this.currentPage < this.totalPages()) this.currentPage++; }
  lastPage (e: Event): void { e.preventDefault(); this.currentPage = this.totalPages(); }
  goToPage(page: number, e: Event): void { e.preventDefault(); if (page > 0) this.currentPage = page; }

  // ════════════════════════════════════════════════════
  // 🔄 CHARGEMENTS INITIAUX
  // ════════════════════════════════════════════════════
  private loadEnseignantConnecte(): void {
    this.saisieNotesService.getEnseignantConnecte()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: id => this.form.patchValue({ enseignantId: id }) });
  }

  private loadReferentiels(): void {
    forkJoin({
      classes: this.saisieNotesService.getMesClasses(),
      annees:  this.saisieNotesService.getAllAnneacademique()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: res => { this.classes = res.classes; this.annees = res.annees; this.cdr.markForCheck(); },
      error: err => console.error('Erreur référentiels', err)
    });
  }

  private chargerRelevePourModification(releveId: number): void {

  const releve = this.mesReleves.find(r => r.id === releveId);

  if (releve) {
    this.modifierReleve(releve);
  } else {

    // fallback si non présent dans le cache
    this.saisieNotesService.getToutesLesNotes().subscribe({
      next: releves => {
        const r = releves.find((x: SaisieNotes) => x.id === releveId);
        if (r) this.modifierReleve(r);
      },
      error: () => console.error('Impossible de charger le relevé')
    });

  }
}
  // ════════════════════════════════════════════════════
  // 🔄 ÉCOUTE DES CHANGEMENTS
  // ════════════════════════════════════════════════════
  private listenChanges(): void {

    // Classe → recharge matières + reset
    this.form.get('classeId')!.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(classeId => {
        this.resetTable();
        this.matieres         = [];
        this.releveValide     = false;
        this.releveVerrouille = false;
        this.form.patchValue({ matiereId: null, semestreId: null }, { emitEvent: false });
        if (!classeId) return;
        this.saisieNotesService.getMesMatieresParClasse(classeId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({ next: m => { this.matieres = m; this.cdr.markForCheck(); } });
      });

    // Matière → semestre auto
    this.form.get('matiereId')!.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(matiereId => {
        const mat = this.matieres.find(m => m.id === matiereId);
        if (mat?.semestreId != null) {
          this.form.get('semestreId')!.patchValue(mat.semestreId, { emitEvent: false });
        }
      });

    // ✅ Auto-chargement dès que le contexte est complet
    this.form.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged((p, c) =>
          p.classeId          === c.classeId          &&
          p.matiereId         === c.matiereId         &&
          p.semestreId        === c.semestreId        &&
          p.anneeAcademiqueId === c.anneeAcademiqueId
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.verifierEtCharger());
  }

  // ════════════════════════════════════════════════════
  // 📊 ORCHESTRATION
  // ════════════════════════════════════════════════════
  private verifierEtCharger(): void {
    const { classeId, matiereId, anneeAcademiqueId, semestreId } = this.form.getRawValue();
    if (!classeId || !matiereId || !anneeAcademiqueId || !semestreId) return;
    this.chargerDepuisContexte(classeId, matiereId, anneeAcademiqueId, semestreId);
  }

  actualisarDonnees(): void {
    const { classeId, matiereId, anneeAcademiqueId, semestreId } = this.form.getRawValue();
    if (!classeId || !matiereId || !anneeAcademiqueId || !semestreId) return;
    this.chargerDepuisContexte(classeId, matiereId, anneeAcademiqueId, semestreId);
  }

  /**
   * ✅ STRATÉGIE ROBUSTE — CHARGEMENT PAR CONTEXTE
   * ─────────────────────────────────────────────────────────────
   * ÉTAPE 1 : Chercher dans this.mesReleves (cache mémoire)
   *           → Évite un appel HTTP qui peut échouer/retourner null
   *
   * ÉTAPE 2 : Si trouvé en cache → getLignesNotesParReleve(id)
   *           directement, sans passer par chargerReleve()
   *
   * ÉTAPE 3 : Si pas en cache → appel chargerReleve() comme fallback
   *           (nouveau relevé pas encore dans la liste)
   *
   * ÉTAPE 4 : Toujours → forkJoin(étudiants + lignes)
   *           → fusionnerEtudiantsEtNotes() : source unique de vérité
   */
  private chargerDepuisContexte(
    classeId:   number,
    matiereId:  number,
    anneeId:    number,
    semestreId: number
  ): void {
    this.loading = true;
    this.cdr.markForCheck();

    // ── ÉTAPE 1 : chercher dans le cache mesReleves ──────────
    const releveCache = this.mesReleves.find(r =>
      r.classeId          === classeId   &&
      r.matiereId         === matiereId  &&
      r.anneeAcademiqueId === anneeId    &&
      r.semestreId        === semestreId
    );

    if (releveCache?.id) {
      // ✅ Trouvé en cache → charger les lignes directement
      this.releveId         = releveCache.id;
      this.releveValide     = releveCache.statut === StatutReleve.VALIDE;
      this.releveVerrouille = releveCache.verrouille ?? false;

      forkJoin({
        etudiants: this.saisieNotesService.getEtudiantsNoteDtoParClasse(classeId),
        lignes:    this.saisieNotesService.getLignesNotesParReleve(releveCache.id)
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.loading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: ({ etudiants, lignes }) => {
          this.fusionnerEtudiantsEtNotes(etudiants, lignes as LigneNote[]);
        },
        error: err => {
          console.error('Erreur lignes depuis cache', err);
          // Fallback : étudiants sans notes
          this.saisieNotesService.getEtudiantsNoteDtoParClasse(classeId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({ next: e => this.fusionnerEtudiantsEtNotes(e, []) });
        }
      });

    } else {
      // ── ÉTAPE 3 : pas en cache → appel chargerReleve() ──────
      this.saisieNotesService.chargerReleve(classeId, matiereId, anneeId, semestreId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: releve => {
            if (releve?.id) {
              this.releveId         = releve.id;
              this.releveValide     = releve.statut === StatutReleve.VALIDE;
              this.releveVerrouille = releve.verrouille ?? false;

              forkJoin({
                etudiants: this.saisieNotesService.getEtudiantsNoteDtoParClasse(classeId),
                lignes:    this.saisieNotesService.getLignesNotesParReleve(releve.id)
              })
              .pipe(
                takeUntil(this.destroy$),
                finalize(() => { this.loading = false; this.cdr.markForCheck(); })
              )
              .subscribe({
                next: ({ etudiants, lignes }) => {
                  this.fusionnerEtudiantsEtNotes(etudiants, lignes as LigneNote[]);
                },
                error: err => {
                  console.error('Erreur lignes depuis backend', err);
                  this.saisieNotesService.getEtudiantsNoteDtoParClasse(classeId)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({ next: e => { this.fusionnerEtudiantsEtNotes(e, []); this.loading = false; this.cdr.markForCheck(); } });
                }
              });
            } else {
              // Aucun relevé → formulaire vierge
              this.releveId = null; this.releveValide = false; this.releveVerrouille = false;
              this.saisieNotesService.getEtudiantsNoteDtoParClasse(classeId)
                .pipe(
                  takeUntil(this.destroy$),
                  finalize(() => { this.loading = false; this.cdr.markForCheck(); })
                )
                .subscribe({ next: e => this.fusionnerEtudiantsEtNotes(e, []) });
            }
          },
          error: () => {
            // chargerReleve() a échoué → étudiants vierges
            this.releveId = null; this.releveValide = false; this.releveVerrouille = false;
            this.saisieNotesService.getEtudiantsNoteDtoParClasse(classeId)
              .pipe(
                takeUntil(this.destroy$),
                finalize(() => { this.loading = false; this.cdr.markForCheck(); })
              )
              .subscribe({ next: e => this.fusionnerEtudiantsEtNotes(e, []) });
          }
        });
    }
  }

  /**
   * ✅ SOURCE UNIQUE DE VÉRITÉ
   * Fusionne étudiants + notes sauvegardées backend.
   * Si lignesBackend est vide → notes null (formulaire vierge).
   */
  private fusionnerEtudiantsEtNotes(etudiants: any[], lignesBackend: LigneNote[]): void {
    this.lignes = etudiants.map(e => {
      const saved = lignesBackend.find(l => l.etudiantId === e.id);
      const nd  = saved?.noteDevoir            ?? null;
      const nso = saved?.noteSessionOrdinaire  ?? null;
      const nsr = saved?.noteSessionRattrapage ?? null;
      // ✅ Backend renvoie etudiantNom dans LigneNoteDto
      // Fallback sur nom+prenom si le champ est absent (EtudiantNoteDto)
      const nomAffiche = saved?.etudiantNom ?? `${e.nom ?? ''} ${e.prenom ?? ''}`.trim();
      return {
        etudiantId:            e.id,
        etudiantNom:           nomAffiche,
        noteDevoir:            nd,
        noteSessionOrdinaire:  nso,
        noteSessionRattrapage: nsr,
        noteFinale:            this.calculerNoteFinale(nd, nso, nsr)
      };
    });
    this.currentPage = 1;
    this.construireFormArray();
    this.cdr.markForCheck();
  }

  // ════════════════════════════════════════════════════
  // 🧱 FORM ARRAY DYNAMIQUE
  // ════════════════════════════════════════════════════
  private construireFormArray(): void {
    this.lignesForm.clear();
    const isReadonly = this.releveVerrouille || this.releveValide;

    this.lignes.forEach((ligne, index) => {
      const group = this.fb.group({
        noteDevoir:            [{ value: ligne.noteDevoir,            disabled: isReadonly }, [Validators.min(0), Validators.max(20)]],
        noteSessionOrdinaire:  [{ value: ligne.noteSessionOrdinaire,  disabled: isReadonly }, [Validators.min(0), Validators.max(20)]],
        noteSessionRattrapage: [{ value: ligne.noteSessionRattrapage, disabled: isReadonly }, [Validators.min(0), Validators.max(20)]],
        noteFinale:            [{ value: ligne.noteFinale, disabled: true }]
      });

      group.valueChanges
        .pipe(
          debounceTime(150),
          distinctUntilChanged((p, c) =>
            p.noteDevoir === c.noteDevoir &&
            p.noteSessionOrdinaire === c.noteSessionOrdinaire &&
            p.noteSessionRattrapage === c.noteSessionRattrapage
          ),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          const nd  = group.get('noteDevoir')!.value            ?? null;
          const nso = group.get('noteSessionOrdinaire')!.value  ?? null;
          const nsr = group.get('noteSessionRattrapage')!.value ?? null;
          const nf  = this.calculerNoteFinale(nd, nso, nsr);
          group.patchValue({ noteFinale: nf }, { emitEvent: false });
          this.lignes[index].noteDevoir            = nd;
          this.lignes[index].noteSessionOrdinaire  = nso;
          this.lignes[index].noteSessionRattrapage = nsr;
          this.lignes[index].noteFinale            = nf;
          this.cdr.markForCheck();
        });

      this.lignesForm.push(group);
    });
  }

  // ════════════════════════════════════════════════════
  // 🧮 CALCUL NOTE FINALE
  // ════════════════════════════════════════════════════
  private calculerNoteFinale(nd: number | null, nso: number | null, nsr: number | null): number | null {
    if (nd === null && nso === null && nsr === null) return null;
    const D = 0.4, S = 0.6;
    let nf = 0;
    if      (nd !== null && nso === null && nsr === null)  nf = nd * D;
    else if (nd === null  && nso !== null && nsr === null)  nf = nso * S;
    else if (nd === null  && nso === null && nsr !== null)  nf = nsr * S;
    else if (nd !== null && nso !== null && nsr === null)  nf = nd * D + nso * S;
    else if (nd !== null && nso === null && nsr !== null)  nf = nd * D + nsr * S;
    else if (nd === null  && nso !== null && nsr !== null)  nf = Math.max(nso, nsr) * S;
    else if (nd !== null && nso !== null && nsr !== null)  nf = nd * D + Math.max(nso, nsr) * S;
    return Math.min(Math.round(nf * 100) / 100, 20);
  }

  // ════════════════════════════════════════════════════
  // 🎨 HELPERS TEMPLATE
  // ════════════════════════════════════════════════════
  getNoteFinaleCssClass(nf: number | null | undefined): string {
    if (nf == null) return 'note-empty';
    if (nf >= 16)   return 'note-excellent';
    if (nf >= 14)   return 'note-bien';
    if (nf >= 12)   return 'note-assez-bien';
    if (nf >= 10)   return 'note-passable';
    return 'note-insuffisant';
  }

  getNoteFinaleIconClass(nf: number | null | undefined): string {
    if (nf == null) return 'bi-dash-circle';
    if (nf >= 16)   return 'bi-trophy-fill';
    if (nf >= 10)   return 'bi-check-circle-fill';
    return 'bi-exclamation-circle-fill';
  }

  getControl(index: number, name: string): any { return this.lignesForm.at(index)?.get(name); }

  private resetTable(): void {
    this.lignes = [];
    this.lignesForm.clear();
    this.currentPage = 1;
    this.releveId    = null;
  }

  // ════════════════════════════════════════════════════
  // 📋 MES RELEVÉS
  // ✅ Accepte un callback optionnel (appelé quand la liste est dispo)
  // ════════════════════════════════════════════════════
  chargerMesReleves(callback?: () => void): void {
    this.mesRelevesLoading = true;
    this.cdr.markForCheck();

    this.saisieNotesService.getToutesLesNotes()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.mesRelevesLoading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: r => {
          this.mesReleves     = Array.isArray(r) ? r : [];
          this.mesRelevesPage = 1;
          this.cdr.markForCheck();
          // ✅ Une fois le cache prêt, on active l'écoute des changements
          if (callback) callback();
        },
        error: () => {
          this.mesReleves = [];
          if (callback) callback();
        }
      });
  }

  get mesRelevesTotalPages(): number { return Math.max(1, Math.ceil(this.mesReleves.length / this.mesRelevesPageSize)); }
  get mesRelevesPagines(): SaisieNotes[] {
    const s = (this.mesRelevesPage - 1) * this.mesRelevesPageSize;
    return this.mesReleves.slice(s, s + this.mesRelevesPageSize);
  }

  nomClasseReleve(classeId: number): string {
    return this.classes.find(c => c.id === classeId)?.code ?? `Classe #${classeId}`;
  }
  nomMatiereReleve(matiereId: number): string {
    const f = this.matieres.find(m => m.id === matiereId);
    return f ? (f.intitule ?? f.code) : `Matière #${matiereId}`;
  }
  nomAnneeReleve(anneeId: number): string {
    return this.annees.find(a => a.id === anneeId)?.libelle ?? `Année #${anneeId}`;
  }

  /**
   * ✅ MODIFIER
   * ─────────────────────────────────────────────────────────────
   * Charge toujours les notes via forkJoin(étudiants + getLignesNotesParReleve)
   * → indépendant de chargerReleve(), jamais de notes manquantes
   */
  modifierReleve(releve: SaisieNotes): void {
    if (!releve?.id) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // ── Reset complet AVANT de patcher le formulaire ──────
    this.resetTable();
    this.releveId         = releve.id;
    this.releveValide     = releve.statut === StatutReleve.VALIDE;
    this.releveVerrouille = releve.verrouille ?? false;

    // ── Patcher le formulaire sans déclencher verifierEtCharger ──
    this.form.patchValue(
      {
        classeId:          releve.classeId,
        matiereId:         releve.matiereId,
        anneeAcademiqueId: releve.anneeAcademiqueId,
        semestreId:        releve.semestreId
      },
      { emitEvent: false }
    );

    this.loading = true;
    this.cdr.markForCheck();

    // ── Fonction principale : charge étudiants + lignes en parallèle ──
    const chargerLignes = () => {
      forkJoin({
        etudiants: this.saisieNotesService.getEtudiantsNoteDtoParClasse(releve.classeId),
        lignes:    this.saisieNotesService.getLignesNotesParReleve(releve.id!)
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.loading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: ({ etudiants, lignes }) => {
          this.fusionnerEtudiantsEtNotes(etudiants, lignes as LigneNote[]);
        },
        error: err => {
          console.error('Erreur modifier', err);
          this.saisieNotesService.getEtudiantsNoteDtoParClasse(releve.classeId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({ next: e => this.fusionnerEtudiantsEtNotes(e, []) });
        }
      });
    };

    // ── Charger les matières si nécessaire avant les lignes ──
    if (!this.matieres.some(m => m.id === releve.matiereId)) {
      this.saisieNotesService.getMesMatieresParClasse(releve.classeId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: m => { this.matieres = m; this.cdr.markForCheck(); chargerLignes(); },
          error: () => chargerLignes()
        });
    } else {
      chargerLignes();
    }
  }

  supprimerDepuisListe(releve: SaisieNotes): void {
    if (!releve?.id) return;
    if (releve.verrouille) { alert('🔒 Ce relevé est verrouillé. Impossible de le supprimer.'); return; }
    if (!confirm(`⚠️ Supprimer le relevé #${releve.id} ? Action irréversible.`)) return;

    this.saisieNotesService.supprimerReleve(releve.id).subscribe({
      next: () => {
        this.mesReleves = this.mesReleves.filter(r => r.id !== releve.id);
        if (this.releveId === releve.id) {
          this.releveId = null; this.releveValide = false; this.releveVerrouille = false;
          this.resetTable(); this.form.reset(); this.matieres = [];
        }
        this.cdr.markForCheck();
      },
      error: err => alert('❌ Erreur : ' + (err?.error?.message || 'Échec'))
    });
  }

  // ════════════════════════════════════════════════════
  // 💾 ENREGISTRER
  // ════════════════════════════════════════════════════
  enregistrer(): void {
    if (this.releveVerrouille) {
      this.showLockAlert('Ce relevé est verrouillé par l\'administration.', 'Contactez l\'administration pour déverrouiller.'); return;
    }
    if (this.form.invalid || this.lignes.length === 0) {
      alert('⚠️ Veuillez remplir tous les champs requis avant d\'enregistrer.'); return;
    }

    this.saving = true;
    this.cdr.markForCheck();
    const raw = this.form.getRawValue();

    const payload: SaisieNotes = {
      classeId:          raw.classeId,
      matiereId:         raw.matiereId,
      anneeAcademiqueId: raw.anneeAcademiqueId,
      semestreId:        raw.semestreId,
      statut:            StatutReleve.EN_ATTENTE,
      enseignantId:      raw.enseignantId,
      lignes: this.lignes.map((l, i) => ({
        etudiantId:            l.etudiantId,
        noteDevoir:            this.lignesForm.at(i).get('noteDevoir')!.value            ?? null,
        noteSessionOrdinaire:  this.lignesForm.at(i).get('noteSessionOrdinaire')!.value  ?? null,
        noteSessionRattrapage: this.lignesForm.at(i).get('noteSessionRattrapage')!.value ?? null
      }))
    } as SaisieNotes;

    this.saisieNotesService.enregistrerOuMettreAJourReleve(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.saving = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: releve => {
          this.releveId         = releve.id ?? null;
          this.releveVerrouille = releve.verrouille ?? false;
          this.releveValide     = releve.statut === StatutReleve.VALIDE;

          if (this.releveVerrouille) {
            this.bloquerSaisie();
            this.showLockAlert('Enregistrement rejeté : relevé verrouillé.', 'L\'administration a verrouillé ce relevé.'); return;
          }

          // ✅ Recharger : notes fraîches + mesReleves mis à jour (cache rechargé)
          this.rechargerApresAction(releve.id!, raw.classeId);
          alert('✅ Notes enregistrées avec succès !');
        },
        error: err => {
          const msg: string = err?.error?.message ?? '';
          if (err.status === 403 || msg.toLowerCase().includes('verrouill')) {
            this.releveVerrouille = true; this.bloquerSaisie();
            this.showLockAlert('Ce relevé est verrouillé.', 'Toute modification est impossible.');
          } else {
            alert('❌ Erreur : ' + (msg || 'Échec de l\'enregistrement'));
          }
        }
      });
  }

  /**
   * ✅ Rechargement après save/recalcul :
   * forkJoin(étudiants + lignes fraîches + mesReleves mis à jour)
   * → met à jour le cache mesReleves pour les prochaines sélections de contexte
   */
  private rechargerApresAction(releveId: number, classeId: number): void {
    forkJoin({
      etudiants: this.saisieNotesService.getEtudiantsNoteDtoParClasse(classeId),
      lignes:    this.saisieNotesService.getLignesNotesParReleve(releveId),
      releves:   this.saisieNotesService.getToutesLesNotes()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ etudiants, lignes, releves }) => {
        this.fusionnerEtudiantsEtNotes(etudiants, lignes as LigneNote[]);
        // ✅ Cache mesReleves mis à jour → prochaine sélection de contexte sera correcte
        this.mesReleves     = Array.isArray(releves) ? releves : [];
        this.mesRelevesPage = 1;
        this.cdr.markForCheck();
      },
      error: () => this.chargerMesReleves()
    });
  }

  // ════════════════════════════════════════════════════
  // 🔒 VERROUILLAGE
  // ════════════════════════════════════════════════════
  private bloquerSaisie(): void {
    this.lignes.forEach((_, i) => {
      const g = this.lignesForm.at(i);
      g?.get('noteDevoir')!.disable({ emitEvent: false });
      g?.get('noteSessionOrdinaire')!.disable({ emitEvent: false });
      g?.get('noteSessionRattrapage')!.disable({ emitEvent: false });
    });
    this.cdr.markForCheck();
  }

  private debloquerSaisie(): void {
    this.lignes.forEach((_, i) => {
      const g = this.lignesForm.at(i);
      g?.get('noteDevoir')!.enable({ emitEvent: false });
      g?.get('noteSessionOrdinaire')!.enable({ emitEvent: false });
      g?.get('noteSessionRattrapage')!.enable({ emitEvent: false });
    });
    this.cdr.markForCheck();
  }

  private showLockAlert(titre: string, detail: string): void { alert(`🔒 ${titre}\n\n${detail}`); }

  // ════════════════════════════════════════════════════
  // ✅ VALIDATION
  // ════════════════════════════════════════════════════
  validerReleve(): void {
    if (!this.releveId) { alert('⚠️ Veuillez d\'abord enregistrer le relevé.'); return; }
    if (this.releveVerrouille) { this.showLockAlert('Relevé verrouillé.', 'Impossible de valider.'); return; }
    if (!confirm('✅ Êtes-vous sûr de vouloir valider ce relevé ?')) return;

    this.validating = true;
    this.cdr.markForCheck();
    this.saisieNotesService.validerReleve(this.releveId)
      .pipe(finalize(() => { this.validating = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.releveValide = true; this.bloquerSaisie(); this.chargerMesReleves(); alert('✅ Relevé validé !'); },
        error: err => alert('❌ Erreur : ' + (err.error?.message || 'Échec'))
      });
  }

  // ════════════════════════════════════════════════════
  // 🔁 RECALCUL
  // ════════════════════════════════════════════════════
  recalculerNotes(): void {
    if (!this.releveId) { alert('⚠️ Enregistrez d\'abord.'); return; }
    if (this.releveVerrouille) { this.showLockAlert('Relevé verrouillé.', 'Recalcul impossible.'); return; }

    this.validating = true;
    this.cdr.markForCheck();
    const raw = this.form.getRawValue();

    this.saisieNotesService.recalculerNotesFinales(this.releveId)
      .pipe(finalize(() => { this.validating = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { alert('✅ Notes recalculées !'); this.rechargerApresAction(this.releveId!, raw.classeId); },
        error: err => alert('❌ Erreur : ' + (err.error?.message || 'Échec'))
      });
  }

  // ════════════════════════════════════════════════════
  // 🗑 SUPPRESSION
  // ════════════════════════════════════════════════════
  supprimerReleve(): void {
    if (!this.releveId) { alert('⚠️ Aucun relevé.'); return; }
    if (this.releveVerrouille) { this.showLockAlert('Relevé verrouillé.', 'Suppression impossible.'); return; }
    if (!confirm('⚠️ Supprimer ce relevé ? Action irréversible.')) return;

    this.saving = true; this.cdr.markForCheck();
    this.saisieNotesService.supprimerReleve(this.releveId)
      .pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.releveId = null; this.releveValide = false; this.releveVerrouille = false;
          this.resetTable(); this.form.reset();
          this.chargerMesReleves(); alert('✅ Relevé supprimé !');
        },
        error: err => alert('❌ Erreur : ' + (err.error?.message || 'Échec'))
      });
  }

  reinitialiser(): void {
    if (confirm('⚠️ Réinitialiser le formulaire ?')) {
      this.form.reset(); this.resetTable(); this.matieres = [];
      this.releveValide = false; this.releveVerrouille = false;
      this.cdr.markForCheck();
    }
  }

  annuler(): void {
    if (confirm('⚠️ Annuler les modifications en cours ?')) this.verifierEtCharger();
  }

  // ════════════════════════════════════════════════════
  // 📤 EXPORT / IMPORT — TABLE COURANTE
  // ════════════════════════════════════════════════════
  toggleExportMenu(): void { this.showExportMenu = !this.showExportMenu; this.showImportMenu = false; }
  toggleImportMenu(): void { this.showImportMenu = !this.showImportMenu; this.showExportMenu = false; }

  onFileImport(event: any, format: 'excel' | 'csv'): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: format === 'excel' ? 'array' : 'string' });
        const data: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        this.processImportedData(data);
        event.target.value = '';
      } catch { alert('❌ Erreur importation.'); }
    };
    format === 'excel' ? reader.readAsArrayBuffer(file) : reader.readAsText(file);
  }

  private processImportedData(data: any[]): void {
    if (!this.lignes.length) { alert('⚠️ Chargez une classe d\'abord.'); return; }
    if (this.releveVerrouille) { this.showLockAlert('Relevé verrouillé.', 'Import impossible.'); return; }
    let imported = 0;
    data.forEach(row => {
      const nom = String(row['Étudiant'] || row['Etudiant'] || '').toLowerCase().trim();
      const idx = this.lignes.findIndex(l => (l.etudiantNom ?? '').toLowerCase().trim().includes(nom));
      if (idx !== -1) {
        this.lignesForm.at(idx).patchValue({
          noteDevoir:            this.parseNote(row['Devoir']),
          noteSessionOrdinaire:  this.parseNote(row['Session Ordinaire']),
          noteSessionRattrapage: this.parseNote(row['Rattrapage'])
        });
        imported++;
      }
    });
    this.showImportMenu = false;
    alert(`✅ ${imported} note(s) importée(s) !`);
  }

  private parseNote(v: any): number | null {
    if (v == null || v === '') return null;
    const p = parseFloat(v); return isNaN(p) ? null : Math.min(Math.max(p, 0), 20);
  }

  exportExcel(): void {
    if (!this.lignes.length) { alert('⚠️ Aucune donnée.'); return; }
    const ws = XLSX.utils.json_to_sheet(this.buildExportData());
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Notes');
    XLSX.writeFile(wb, `Notes_${this.selectedClasse}_${this.selectedMatiere}_${Date.now()}.xlsx`);
    this.showExportMenu = false;
  }

  exportCSV(): void {
    if (!this.lignes.length) { alert('⚠️ Aucune donnée.'); return; }
    saveAs(new Blob([XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(this.buildExportData()))], { type: 'text/csv;charset=utf-8;' }),
      `Notes_${this.selectedClasse}_${this.selectedMatiere}_${Date.now()}.csv`);
    this.showExportMenu = false;
  }

  exportPDF(): void {
    if (!this.lignes.length) { alert('⚠️ Aucune donnée.'); return; }
    this.genererPDF(
      this.lignes, this.selectedClasse, this.selectedMatiere, this.selectedAnnee,
      this.releveId, this.releveVerrouille,
      `Notes_${this.selectedClasse}_${this.selectedMatiere}_${Date.now()}.pdf`
    );
    this.showExportMenu = false;
  }

  /**
   * ✅ IMPRIMER — table courante (this.lignes synchronisée)
   */
  imprimer(): void {
    if (!this.lignes.length) { alert('⚠️ Aucune donnée.'); return; }
    this.genererPDF(
      this.lignes, this.selectedClasse, this.selectedMatiere, this.selectedAnnee,
      this.releveId, this.releveVerrouille,
      `Impression_${this.selectedClasse}_${Date.now()}.pdf`
    );
  }

  private buildExportData(): object[] {
    return this.lignes.map((l, i) => ({
      '#':               i + 1,
      'Étudiant':        l.etudiantNom,
      'Devoir':          l.noteDevoir            ?? '',
      'Session Ordinaire': l.noteSessionOrdinaire ?? '',
      'Rattrapage':      l.noteSessionRattrapage  ?? '',
      'Note Finale':     l.noteFinale             ?? ''
    }));
  }

  // ════════════════════════════════════════════════════
  // 📤 EXPORT / IMPORT — DEPUIS LA LISTE "MES RELEVÉS"
  // ✅ Lignes rechargées depuis le backend avant génération
  // ════════════════════════════════════════════════════

  exporterReleveExcel(releve: SaisieNotes): void {
    if (!releve?.id) return;
    this.saisieNotesService.getLignesNotesParReleve(releve.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: lignes => {
          if (!lignes?.length) { alert('⚠️ Aucune note dans ce relevé.'); return; }
          const cl  = this.nomClasseReleve(releve.classeId);
          const mat = this.nomMatiereReleve(releve.matiereId);
          const data = lignes.map((l, i) => ({
            '#': i + 1,
            'Étudiant':           l.etudiantNom ?? `Étudiant ${l.etudiantId}`,
            'Devoir (0-20)':      l.noteDevoir             ?? '--',
            'Session Ordinaire':  l.noteSessionOrdinaire   ?? '--',
            'Session Rattrapage': l.noteSessionRattrapage  ?? '--',
            'Note Finale':        l.noteFinale             ?? '--'
          }));
          const ws = XLSX.utils.json_to_sheet(data);
          ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 14 }];
          const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Notes');
          XLSX.writeFile(wb, `Notes_${cl}_${mat}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        },
        error: () => alert('❌ Impossible de charger les notes.')
      });
  }

  exporterRelevePDF(releve: SaisieNotes): void {
    if (!releve?.id) return;
    this.saisieNotesService.getLignesNotesParReleve(releve.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: lignes => {
          if (!lignes?.length) { alert('⚠️ Aucune note dans ce relevé.'); return; }
          const cl  = this.nomClasseReleve(releve.classeId);
          const mat = this.nomMatiereReleve(releve.matiereId);
          const an  = this.nomAnneeReleve(releve.anneeAcademiqueId);
          this.genererPDF(
            lignes as LigneNote[], cl, mat, an, releve.id, releve.verrouille,
            `Notes_${cl}_${mat}_${new Date().toISOString().slice(0, 10)}.pdf`
          );
        },
        error: () => alert('❌ Impossible de charger les notes.')
      });
  }

  /**
   * ✅ IMPRIMER depuis la liste — recharge les lignes avant impression
   */
  imprimerReleve(releve: SaisieNotes): void {
    this.exporterRelevePDF(releve);
  }

  /**
   * ✅ GÉNÉRATEUR PDF UNIFIÉ
   * Utilisé par : exportPDF, imprimer, exporterRelevePDF, imprimerReleve
   */
  private genererPDF(
    lignes:     LigneNote[],
    classe:     string,
    matiere:    string,
    annee:      string,
    releveId:   number | null | undefined,
    verrouille: boolean | undefined,
    nomFichier: string
  ): void {
    const doc = new jsPDF();

    doc.setFillColor(10, 14, 26);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text('RELEVÉ DE NOTES', 105, 11, { align: 'center' });
    doc.setFontSize(8.5); doc.setTextColor(148, 163, 184); doc.setFont('helvetica', 'normal');
    doc.text(
      releveId ? `${classe}  ·  ${matiere}  ·  ${annee}  ·  Relevé #${releveId}` : `${classe}  ·  ${matiere}  ·  ${annee}`,
      105, 21, { align: 'center' }
    );

    let startY = 33;
    if (verrouille) {
      doc.setFontSize(9); doc.setTextColor(217, 119, 6);
      doc.text('🔒 Relevé verrouillé par l\'administration', 14, 35);
      startY = 42;
    }

    autoTable(doc, {
      startY,
      head: [['#', 'Étudiant', 'Devoir', 'Sess. Ord.', 'Rattrapage', 'Note Finale']],
      body: lignes.map((l, i) => [
        (i + 1).toString(),
        l.etudiantNom ?? `Étudiant ${l.etudiantId}`,
        l.noteDevoir?.toString()            ?? '--',
        l.noteSessionOrdinaire?.toString()  ?? '--',
        l.noteSessionRattrapage?.toString() ?? '--',
        l.noteFinale?.toString()            ?? '--'
      ]),
      theme: 'grid',
      headStyles:         { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      bodyStyles:         { halign: 'center', fontSize: 9.5 },
      columnStyles:       { 0: { cellWidth: 12 }, 1: { cellWidth: 65, halign: 'left' }, 5: { fontStyle: 'bold' } },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didParseCell: d => {
        if (d.section === 'body' && d.column.index === 5 && d.cell.raw !== '--') {
          const v = parseFloat(d.cell.raw as string);
          if (!isNaN(v)) { d.cell.styles.textColor = v >= 10 ? [5, 150, 105] : [225, 29, 72]; d.cell.styles.fontStyle = 'bold'; }
        }
      }
    });

    const pages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
      doc.text(`Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 14, doc.internal.pageSize.getHeight() - 6);
      doc.text(`Page ${p}/${pages}`, 196, doc.internal.pageSize.getHeight() - 6, { align: 'right' });
    }
    doc.save(nomFichier);
  }

  // ════════════════════════════════════════════════════
  // 📊 MOYENNES — lit depuis this.lignes
  // ════════════════════════════════════════════════════
  getMoyenne(type: 'devoir' | 'ordinaire' | 'rattrapage' | 'finale'): string {
    if (!this.lignes.length) return '--';
    let sum = 0, count = 0;
    this.lignes.forEach(l => {
      let n: number | null = null;
      switch (type) {
        case 'devoir':     n = l.noteDevoir            ?? null; break;
        case 'ordinaire':  n = l.noteSessionOrdinaire  ?? null; break;
        case 'rattrapage': n = l.noteSessionRattrapage ?? null; break;
        case 'finale':     n = l.noteFinale            ?? null; break;
      }
      if (n !== null) { sum += n; count++; }
    });
    return count > 0 ? (sum / count).toFixed(2) : '--';
  }
}